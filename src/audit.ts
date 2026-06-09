import { chromium, type Browser, type Page } from '@playwright/test';
import { resolve } from 'path';
import type { AuditFinding, AuditReport, AuditorConfig, Impact, RouteResult } from './types';
import { evaluateThresholds } from './config';
import { runAxeScan, countAxePasses } from './scanner/axe';
import { runKeyboardAudit } from './scanner/keyboard';
import { applyVariant } from './scanner/variants';

const PACKAGE_VERSION = '1.0.0';

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

    const waitMatch = step.match(/^wait\s+(\d+)ms$/i);
    if (waitMatch) {
      await page.waitForTimeout(Number(waitMatch[1]));
      continue;
    }

    throw new Error(`Unsupported scenario step: "${step}". Supported: click <selector>, type <text> into <selector>, wait <n>ms`);
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

export async function audit(config: AuditorConfig): Promise<AuditReport> {
  const browser = await chromium.launch({ headless: true });
  const allFindings: AuditFinding[] = [];
  const routeResults: RouteResult[] = [];
  let totalPasses = 0;
  let keyboardFocusOrder: string[] = [];
  let keyboardIssues: string[] = [];

  const variants = config.variants ?? ['default'];
  const scenarios = config.scenarios ?? [];

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

          const axeFindings = await runAxeScan(page, config, ctx);
          allFindings.push(...axeFindings);

          const passCount = await countAxePasses(page, config);
          totalPasses += passCount;

          if (variant === 'default') {
            const keyboard = await runKeyboardAudit(page, config, ctx);
            allFindings.push(...keyboard.findings);
            keyboardFocusOrder = keyboard.focusOrder;
            keyboardIssues = keyboard.issues;
          }

          routeResults.push({
            path: route.path,
            name: route.name,
            url,
            variant,
            violationCount: axeFindings.filter((f) => !f.needsManualReview).length,
            incompleteCount: axeFindings.filter((f) => f.needsManualReview).length,
            passCount,
          });

          for (const scenario of scenarios.filter((s) => s.route === route.path)) {
            const scenarioPage = await createPage(browser, config, scenario.auth ?? route.auth);
            try {
              await scenarioPage.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
              await applyVariant(scenarioPage, variant);
              await applyScenarioSteps(scenarioPage, scenario.steps);

              const scenarioCtx = { ...ctx, scenario: scenario.name };
              const scenarioFindings = await runAxeScan(scenarioPage, config, scenarioCtx);
              allFindings.push(...scenarioFindings);

              routeResults.push({
                path: route.path,
                name: route.name,
                url,
                variant,
                scenario: scenario.name,
                violationCount: scenarioFindings.filter((f) => !f.needsManualReview).length,
                incompleteCount: scenarioFindings.filter((f) => f.needsManualReview).length,
                passCount: await countAxePasses(scenarioPage, config),
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
  } finally {
    await browser.close();
  }

  const violations = allFindings.filter((f) => !f.needsManualReview);
  const incomplete = allFindings.filter((f) => f.needsManualReview);

  const byImpact: Record<Impact, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  for (const finding of violations) {
    byImpact[finding.impact]++;
  }

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
      passed: false,
    },
    findings: allFindings,
    routes: routeResults,
    keyboardAudit: {
      focusOrder: keyboardFocusOrder,
      issues: keyboardIssues,
    },
  };

  report.summary.passed = evaluateThresholds(report, config);
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
  };

  // Override baseUrl handling for single URL
  const parsed = new URL(url);
  config.baseUrl = `${parsed.protocol}//${parsed.host}`;
  config.routes = [{ path: parsed.pathname + parsed.search, name: 'Page' }];

  return audit(config);
}
