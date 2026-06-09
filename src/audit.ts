import { chromium, type Browser, type Page } from '@playwright/test';
import { resolve } from 'path';
import type { AuditFinding, AuditReport, AuditorConfig, Impact, RouteResult } from './types';
import { evaluateThresholds } from './config';
import { runAxeScan } from './scanner/axe';
import {
  extractNavSignature,
  runBehavioralChecks,
  runCrossPageChecks,
  type NavSignature,
} from './scanner/behavioral';
import { runKeyboardAudit, runScenarioKeyboardChecks } from './scanner/keyboard';
import { applyVariant } from './scanner/variants';
import { buildWcagChecklist, summarizeChecklist } from './wcag/checklist';
import { applyWaivers, getActiveWaivers, getExpiredWaivers, loadWaivers } from './waivers';
import { enrichChecklist, enrichFindings } from './wcag/enrich';
import { compareWithBaseline, loadBaselineReport } from './report/baseline';
import { groupFindings } from './report/grouping';
import { runStaticAnalysis } from './scanner/static';
import { getReportW3cReferences } from './wcag/urls';

const PACKAGE_VERSION = '1.7.0';

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${base}${route}`;
}

async function applyScenarioSteps(page: Page, steps: string[]): Promise<void> {
  for (const step of steps) {
    const clickMatch = step.match(/^click\s+(.+)$/i);
    if (clickMatch) {
      await page.locator(clickMatch[1].trim()).click();
      await page.waitForTimeout(300);
      continue;
    }

    const typeMatch = step.match(/^type\s+(.+?)\s+into\s+(.+)$/i);
    if (typeMatch) {
      await page.locator(typeMatch[2].trim()).fill(typeMatch[1].trim());
      continue;
    }

    const pressMatch = step.match(/^press\s+(.+)$/i);
    if (pressMatch) {
      await page.keyboard.press(pressMatch[1].trim());
      continue;
    }

    const waitMatch = step.match(/^wait\s+(\d+)ms$/i);
    if (waitMatch) {
      await page.waitForTimeout(Number(waitMatch[1]));
      continue;
    }

    throw new Error(
      'Unsupported scenario step. Supported: click <selector>, type <text> into <selector>, press <key>, wait <n>ms',
    );
  }
}

async function createPage(
  browser: Browser,
  config: AuditorConfig,
  authProfile?: string,
): Promise<Page> {
  const contextOptions: { storageState?: string } = {};

  if (authProfile && config.auth?.profiles[authProfile]) {
    const profile = config.auth.profiles[authProfile];
    contextOptions.storageState = resolve(process.cwd(), profile.storageState);
  }

  const context = await browser.newContext(contextOptions);
  return context.newPage();
}

function mergeBehavioralResult(
  result: { findings: AuditFinding[]; passedCriteria: string[]; passedChecks: string[] },
  allFindings: AuditFinding[],
  passedCriteria: Set<string>,
  allPassedChecks: string[],
): void {
  allFindings.push(...result.findings);
  for (const criterion of result.passedCriteria) {
    passedCriteria.add(criterion);
  }
  allPassedChecks.push(...result.passedChecks);
}

export async function audit(config: AuditorConfig): Promise<AuditReport> {
  const browser = await chromium.launch({ headless: true });
  const allFindings: AuditFinding[] = [];
  const routeResults: RouteResult[] = [];
  const passedCriteria = new Set<string>();
  const behavioralPassedChecks: string[] = [];
  const navSignatures: NavSignature[] = [];
  let totalPasses = 0;
  let keyboardFocusOrder: string[] = [];
  let keyboardIssues: string[] = [];

  const variants = config.variants ?? ['default'];
  const scenarios = config.scenarios ?? [];
  const behavioralEnabled = config.behavioral?.enabled !== false;

  try {
    for (const route of config.routes) {
      for (const variant of variants) {
        const url = buildUrl(config.baseUrl, route.path);
        const page = await createPage(browser, config, route.auth);

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
          await applyVariant(page, variant);

          const ctx = {
            route: route.path,
            routeName: route.name,
            variant,
          };

          const pageFindings: AuditFinding[] = [];

          const axeResult = await runAxeScan(page, config, ctx);
          pageFindings.push(...axeResult.findings);
          allFindings.push(...axeResult.findings);
          totalPasses += axeResult.passRuleCount;
          for (const criterion of axeResult.passedCriteria) {
            passedCriteria.add(criterion);
          }

          if (variant === 'default') {
            const keyboard = await runKeyboardAudit(page, config, ctx);
            pageFindings.push(...keyboard.findings);
            allFindings.push(...keyboard.findings);
            keyboardFocusOrder = keyboard.focusOrder;
            keyboardIssues = keyboard.issues;

            if (keyboard.findings.length === 0) {
              passedCriteria.add('2.1.2');
              passedCriteria.add('2.4.7');
            }

            if (behavioralEnabled) {
              navSignatures.push(await extractNavSignature(page, route.path));
            }
          }

          if (behavioralEnabled && (variant === 'default' || variant === 'zoom-200' || variant === 'reduced-motion')) {
            const behavioral = await runBehavioralChecks(page, config, ctx);
            pageFindings.push(...behavioral.findings);
            mergeBehavioralResult(behavioral, allFindings, passedCriteria, behavioralPassedChecks);
          }

          routeResults.push({
            path: route.path,
            name: route.name,
            url,
            variant,
            violationCount: pageFindings.filter((f) => !f.needsManualReview).length,
            incompleteCount: pageFindings.filter((f) => f.needsManualReview).length,
            passCount: axeResult.passRuleCount,
          });

          for (const scenario of scenarios.filter((s) => s.route === route.path)) {
            const scenarioPage = await createPage(browser, config, scenario.auth ?? route.auth);
            try {
              await scenarioPage.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
              await applyVariant(scenarioPage, variant);
              await applyScenarioSteps(scenarioPage, scenario.steps);

              const scenarioCtx = { ...ctx, scenario: scenario.name };
              const scenarioFindings: AuditFinding[] = [];

              const scenarioAxe = await runAxeScan(scenarioPage, config, scenarioCtx);
              scenarioFindings.push(...scenarioAxe.findings);
              allFindings.push(...scenarioAxe.findings);
              totalPasses += scenarioAxe.passRuleCount;
              for (const criterion of scenarioAxe.passedCriteria) {
                passedCriteria.add(criterion);
              }

              if (variant === 'default') {
                const scenarioKeyboard = await runScenarioKeyboardChecks(scenarioPage, config, scenarioCtx);
                scenarioFindings.push(...scenarioKeyboard.findings);
                allFindings.push(...scenarioKeyboard.findings);
              }

              if (behavioralEnabled && (variant === 'default' || variant === 'zoom-200' || variant === 'reduced-motion')) {
                const scenarioBehavioral = await runBehavioralChecks(scenarioPage, config, scenarioCtx);
                scenarioFindings.push(...scenarioBehavioral.findings);
                mergeBehavioralResult(scenarioBehavioral, allFindings, passedCriteria, behavioralPassedChecks);
              }

              routeResults.push({
                path: route.path,
                name: route.name,
                url,
                variant,
                scenario: scenario.name,
                violationCount: scenarioFindings.filter((f) => !f.needsManualReview).length,
                incompleteCount: scenarioFindings.filter((f) => f.needsManualReview).length,
                passCount: scenarioAxe.passRuleCount,
              });
            } finally {
              await scenarioPage.context().close();
            }
          }
        } finally {
          await page.context().close();
        }
      }
    }

    if (behavioralEnabled && navSignatures.length >= 2) {
      const crossPage = runCrossPageChecks(config, navSignatures);
      mergeBehavioralResult(crossPage, allFindings, passedCriteria, behavioralPassedChecks);
    }
  } finally {
    await browser.close();
  }

  const cwd = process.cwd();
  const staticResult = runStaticAnalysis(cwd, config);
  allFindings.push(...staticResult.findings);

  const waiverEntries = loadWaivers(cwd, config);
  const enrichedFindings = applyWaivers(enrichFindings(allFindings, config.wcag.version), waiverEntries);

  const violations = enrichedFindings.filter((f) => !f.needsManualReview && !f.waived);
  const waived = enrichedFindings.filter((f) => f.waived);
  const incomplete = enrichedFindings.filter((f) => f.needsManualReview);

  const byImpact: Record<Impact, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  for (const finding of violations) {
    byImpact[finding.impact]++;
  }

  const wcagChecklist = enrichChecklist(buildWcagChecklist(config, enrichedFindings, passedCriteria));

  const report: AuditReport = {
    meta: {
      tool: 'a11y-auditor-agent',
      version: PACKAGE_VERSION,
      wcag: config.wcag,
      timestamp: new Date().toISOString(),
      baseUrl: config.baseUrl,
    },
    summary: {
      routesScanned: routeResults.length,
      violations: violations.length,
      incomplete: incomplete.length,
      passes: totalPasses,
      byImpact,
      waived: waived.length,
      passed: false,
    },
    waivers: waiverEntries.length
      ? {
          active: getActiveWaivers(waiverEntries),
          expired: getExpiredWaivers(waiverEntries),
        }
      : undefined,
    findings: enrichedFindings,
    findingGroups: groupFindings(enrichedFindings.filter((f) => !f.needsManualReview)),
    staticAudit:
      config.static?.enabled === true
        ? { filesScanned: staticResult.filesScanned, warnings: staticResult.warnings }
        : undefined,
    routes: routeResults,
    keyboardAudit: {
      focusOrder: keyboardFocusOrder,
      issues: keyboardIssues,
    },
    behavioralAudit: behavioralEnabled
      ? {
          passedChecks: [...new Set(behavioralPassedChecks)],
          checksRun: [...new Set(behavioralPassedChecks)].length,
        }
      : undefined,
    wcagChecklist,
    checklistSummary: summarizeChecklist(wcagChecklist),
    w3cReferences: getReportW3cReferences(config.wcag.version),
  };

  report.summary.passed = evaluateThresholds(report, config);
  report.baselineDiff = compareWithBaseline(report, loadBaselineReport(cwd, config.baseline?.file));
  return report;
}

export async function auditUrl(
  url: string,
  options: Partial<AuditorConfig> = {},
): Promise<AuditReport> {
  const config: AuditorConfig = {
    wcag: options.wcag ?? { version: '2.2', level: 'AA' },
    baseUrl: url,
    routes: options.routes ?? [{ path: '/', name: 'Page' }],
    variants: options.variants ?? ['default'],
    thresholds: options.thresholds ?? { failOn: ['critical', 'serious'], maxViolations: 0 },
    output: options.output,
    axe: options.axe,
    auth: options.auth,
    scenarios: options.scenarios,
    behavioral: options.behavioral,
  };

  const parsed = new URL(url);
  config.baseUrl = `${parsed.protocol}//${parsed.host}`;
  config.routes = [{ path: parsed.pathname + parsed.search, name: 'Page' }];

  return audit(config);
}
