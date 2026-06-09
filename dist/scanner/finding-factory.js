"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFinding = createFinding;
const criteria_1 = require("../wcag/criteria");
const urls_1 = require("../wcag/urls");
function createFinding(config, ctx, detail) {
    const primary = detail.criteria[0];
    const criterion = primary ? (0, criteria_1.getCriterion)(primary) : undefined;
    const w3c = criterion ? (0, urls_1.buildW3cLinks)(criterion.id, criterion.slug, config.wcag.version) : undefined;
    return {
        id: `${detail.rule}-${ctx.route}-${ctx.variant}-${detail.selector}`.replace(/\s+/g, '-'),
        wcag: {
            version: config.wcag.version,
            criteria: detail.criteria,
            level: config.wcag.level,
        },
        impact: detail.impact,
        rule: detail.rule,
        summary: detail.summary,
        description: detail.description,
        helpUrl: detail.helpUrl ?? w3c?.quickRef ?? 'https://www.w3.org/WAI/WCAG22/quickref/',
        selector: detail.selector,
        remediation: detail.remediation,
        needsManualReview: detail.needsManualReview ?? false,
        route: ctx.route,
        routeName: ctx.routeName,
        variant: ctx.variant,
        scenario: ctx.scenario,
        source: ctx.source,
        criterionTitle: criterion?.title,
        w3c,
    };
}
//# sourceMappingURL=finding-factory.js.map