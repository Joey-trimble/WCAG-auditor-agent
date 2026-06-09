"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAxeScan = runAxeScan;
exports.countAxePasses = countAxePasses;
const playwright_1 = __importDefault(require("@axe-core/playwright"));
const config_1 = require("../config");
const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];
function normalizeImpact(impact) {
    if (impact && IMPACT_ORDER.includes(impact)) {
        return impact;
    }
    return 'moderate';
}
function extractWcagCriteria(tags) {
    return tags
        .filter((tag) => /^wcag\d{3}$/.test(tag) || /^wcag\d{4}$/.test(tag))
        .map((tag) => {
        const match = tag.match(/^wcag(\d)(\d)(\d)$/);
        if (match) {
            return `${match[1]}.${match[2]}.${match[3]}`;
        }
        return tag;
    });
}
function nodeToFinding(rule, node, ctx) {
    const criteria = extractWcagCriteria(rule.tags);
    const selector = node.target.join(' > ');
    return {
        id: `${rule.id}-${selector}-${ctx.variant}-${ctx.scenario ?? 'base'}`,
        wcag: {
            version: ctx.config.wcag.version,
            criteria: criteria.length ? criteria : ['unknown'],
            level: ctx.config.wcag.level,
        },
        impact: normalizeImpact(rule.impact),
        rule: rule.id,
        summary: rule.help,
        description: node.failureSummary ?? rule.description,
        helpUrl: rule.helpUrl,
        selector,
        html: node.html,
        remediation: rule.help,
        needsManualReview: ctx.needsManualReview,
        route: ctx.route,
        routeName: ctx.routeName,
        variant: ctx.variant,
        scenario: ctx.scenario,
        source: 'axe',
    };
}
async function runAxeScan(page, config, ctx) {
    const tags = (0, config_1.getWcagTags)(config.wcag.version, config.wcag.level);
    let builder = new playwright_1.default({ page }).withTags(tags);
    if (config.axe?.disableRules?.length) {
        builder = builder.disableRules(config.axe.disableRules);
    }
    if (config.axe?.include?.length) {
        builder = builder.include(config.axe.include);
    }
    if (config.axe?.exclude?.length) {
        builder = builder.exclude(config.axe.exclude);
    }
    const results = await builder.analyze();
    const findings = [];
    for (const violation of results.violations) {
        for (const node of violation.nodes) {
            findings.push(nodeToFinding(violation, node, {
                config,
                route: ctx.route,
                routeName: ctx.routeName,
                variant: ctx.variant,
                scenario: ctx.scenario,
                needsManualReview: false,
            }));
        }
    }
    for (const incomplete of results.incomplete) {
        for (const node of incomplete.nodes) {
            findings.push(nodeToFinding(incomplete, node, {
                config,
                route: ctx.route,
                routeName: ctx.routeName,
                variant: ctx.variant,
                scenario: ctx.scenario,
                needsManualReview: true,
            }));
        }
    }
    return findings;
}
async function countAxePasses(page, config) {
    const tags = (0, config_1.getWcagTags)(config.wcag.version, config.wcag.level);
    let builder = new playwright_1.default({ page }).withTags(tags);
    if (config.axe?.disableRules?.length) {
        builder = builder.disableRules(config.axe.disableRules);
    }
    const results = await builder.analyze();
    return results.passes.length;
}
//# sourceMappingURL=axe.js.map