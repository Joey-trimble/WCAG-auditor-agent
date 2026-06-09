"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = audit;
exports.auditUrl = auditUrl;
const test_1 = require("@playwright/test");
const path_1 = require("path");
const config_1 = require("./config");
const axe_1 = require("./scanner/axe");
const behavioral_1 = require("./scanner/behavioral");
const keyboard_1 = require("./scanner/keyboard");
const variants_1 = require("./scanner/variants");
const checklist_1 = require("./wcag/checklist");
const waivers_1 = require("./waivers");
const enrich_1 = require("./wcag/enrich");
const urls_1 = require("./wcag/urls");
const PACKAGE_VERSION = '1.6.0';
function buildUrl(baseUrl, path) {
    const base = baseUrl.replace(/\/$/, '');
    const route = path.startsWith('/') ? path : `/${path}`;
    return `${base}${route}`;
}
async function applyScenarioSteps(page, steps) {
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
        throw new Error('Unsupported scenario step. Supported: click <selector>, type <text> into <selector>, press <key>, wait <n>ms');
    }
}
async function createPage(browser, config, authProfile) {
    const contextOptions = {};
    if (authProfile && config.auth?.profiles[authProfile]) {
        const profile = config.auth.profiles[authProfile];
        contextOptions.storageState = (0, path_1.resolve)(process.cwd(), profile.storageState);
    }
    const context = await browser.newContext(contextOptions);
    return context.newPage();
}
function mergeBehavioralResult(result, allFindings, passedCriteria, allPassedChecks) {
    allFindings.push(...result.findings);
    for (const criterion of result.passedCriteria) {
        passedCriteria.add(criterion);
    }
    allPassedChecks.push(...result.passedChecks);
}
async function audit(config) {
    const browser = await test_1.chromium.launch({ headless: true });
    const allFindings = [];
    const routeResults = [];
    const passedCriteria = new Set();
    const behavioralPassedChecks = [];
    const navSignatures = [];
    let totalPasses = 0;
    let keyboardFocusOrder = [];
    let keyboardIssues = [];
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
                    await (0, variants_1.applyVariant)(page, variant);
                    const ctx = {
                        route: route.path,
                        routeName: route.name,
                        variant,
                    };
                    const pageFindings = [];
                    const axeResult = await (0, axe_1.runAxeScan)(page, config, ctx);
                    pageFindings.push(...axeResult.findings);
                    allFindings.push(...axeResult.findings);
                    totalPasses += axeResult.passRuleCount;
                    for (const criterion of axeResult.passedCriteria) {
                        passedCriteria.add(criterion);
                    }
                    if (variant === 'default') {
                        const keyboard = await (0, keyboard_1.runKeyboardAudit)(page, config, ctx);
                        pageFindings.push(...keyboard.findings);
                        allFindings.push(...keyboard.findings);
                        keyboardFocusOrder = keyboard.focusOrder;
                        keyboardIssues = keyboard.issues;
                        if (keyboard.findings.length === 0) {
                            passedCriteria.add('2.1.2');
                            passedCriteria.add('2.4.7');
                        }
                        if (behavioralEnabled) {
                            navSignatures.push(await (0, behavioral_1.extractNavSignature)(page, route.path));
                        }
                    }
                    if (behavioralEnabled && (variant === 'default' || variant === 'zoom-200')) {
                        const behavioral = await (0, behavioral_1.runBehavioralChecks)(page, config, ctx);
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
                            await (0, variants_1.applyVariant)(scenarioPage, variant);
                            await applyScenarioSteps(scenarioPage, scenario.steps);
                            const scenarioCtx = { ...ctx, scenario: scenario.name };
                            const scenarioFindings = [];
                            const scenarioAxe = await (0, axe_1.runAxeScan)(scenarioPage, config, scenarioCtx);
                            scenarioFindings.push(...scenarioAxe.findings);
                            allFindings.push(...scenarioAxe.findings);
                            totalPasses += scenarioAxe.passRuleCount;
                            for (const criterion of scenarioAxe.passedCriteria) {
                                passedCriteria.add(criterion);
                            }
                            if (behavioralEnabled && (variant === 'default' || variant === 'zoom-200')) {
                                const scenarioBehavioral = await (0, behavioral_1.runBehavioralChecks)(scenarioPage, config, scenarioCtx);
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
                        }
                        finally {
                            await scenarioPage.context().close();
                        }
                    }
                }
                finally {
                    await page.context().close();
                }
            }
        }
        if (behavioralEnabled && navSignatures.length >= 2) {
            const crossPage = (0, behavioral_1.runCrossPageChecks)(config, navSignatures);
            mergeBehavioralResult(crossPage, allFindings, passedCriteria, behavioralPassedChecks);
        }
    }
    finally {
        await browser.close();
    }
    const cwd = process.cwd();
    const waiverEntries = (0, waivers_1.loadWaivers)(cwd, config);
    const enrichedFindings = (0, waivers_1.applyWaivers)((0, enrich_1.enrichFindings)(allFindings, config.wcag.version), waiverEntries);
    const violations = enrichedFindings.filter((f) => !f.needsManualReview && !f.waived);
    const waived = enrichedFindings.filter((f) => f.waived);
    const incomplete = enrichedFindings.filter((f) => f.needsManualReview);
    const byImpact = {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
    };
    for (const finding of violations) {
        byImpact[finding.impact]++;
    }
    const wcagChecklist = (0, enrich_1.enrichChecklist)((0, checklist_1.buildWcagChecklist)(config, enrichedFindings, passedCriteria));
    const report = {
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
                active: (0, waivers_1.getActiveWaivers)(waiverEntries),
                expired: (0, waivers_1.getExpiredWaivers)(waiverEntries),
            }
            : undefined,
        findings: enrichedFindings,
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
        checklistSummary: (0, checklist_1.summarizeChecklist)(wcagChecklist),
        w3cReferences: (0, urls_1.getReportW3cReferences)(config.wcag.version),
    };
    report.summary.passed = (0, config_1.evaluateThresholds)(report, config);
    return report;
}
async function auditUrl(url, options = {}) {
    const config = {
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
//# sourceMappingURL=audit.js.map