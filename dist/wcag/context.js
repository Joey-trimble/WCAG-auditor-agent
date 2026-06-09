"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWcagContext = buildWcagContext;
const hierarchy_1 = require("./hierarchy");
const playbook_1 = require("./playbook");
function toContextCriterion(item, findings) {
    const guidance = item.guidance ?? (0, playbook_1.getPlaybookEntry)(item.id, item.title);
    return {
        id: item.id,
        title: item.title,
        level: item.level,
        principle: item.principle,
        guideline: item.guideline,
        hierarchy: (0, hierarchy_1.formatCriterionHierarchy)(item),
        status: item.status,
        isWcag22Only: (0, hierarchy_1.isWcag22OnlyCriterion)(item.id),
        introducedIn: item.introducedIn,
        findingCount: item.findingCount,
        w3c: item.w3c,
        guidance,
        findings: findings.map((f) => ({
            id: f.id,
            impact: f.impact,
            rule: f.rule,
            source: f.source,
            selector: f.selector,
            route: f.route,
            summary: f.summary,
            waived: f.waived,
        })),
    };
}
function buildWcagContext(report) {
    const checklist = report.wcagChecklist ?? [];
    const principleGroups = (0, hierarchy_1.summarizeChecklistByPrinciple)(checklist);
    const findingsByCriterion = new Map();
    for (const finding of report.findings) {
        const criterionId = finding.wcag.criteria.find((id) => id !== 'unknown');
        if (!criterionId) {
            continue;
        }
        const list = findingsByCriterion.get(criterionId) ?? [];
        list.push(finding);
        findingsByCriterion.set(criterionId, list);
    }
    const principles = principleGroups.map((group) => ({
        principle: group.principle,
        summary: group.summary,
        guidelines: group.guidelines.map((guideline) => ({
            id: guideline.id,
            title: guideline.title,
            criteria: guideline.criteria
                .map((c) => checklist.find((item) => item.id === c.id))
                .filter((item) => Boolean(item))
                .map((item) => toContextCriterion(item, findingsByCriterion.get(item.id) ?? [])),
        })),
    }));
    const wcag22NewCriteria = checklist
        .filter((item) => (0, hierarchy_1.isWcag22OnlyCriterion)(item.id))
        .map((item) => toContextCriterion(item, findingsByCriterion.get(item.id) ?? []));
    const topFindings = report.findings
        .filter((f) => !f.needsManualReview && !f.waived)
        .slice(0, 20)
        .map((f) => {
        const criterionId = f.wcag.criteria.find((id) => id !== 'unknown');
        const checklistItem = criterionId ? checklist.find((c) => c.id === criterionId) : undefined;
        const hierarchy = checklistItem
            ? (0, hierarchy_1.formatCriterionHierarchy)(checklistItem)
            : f.criterionTitle ?? criterionId ?? 'unknown';
        return {
            hierarchy,
            impact: f.impact,
            rule: f.rule,
            selector: f.selector,
            route: f.route,
            summary: f.summary,
            techniques: f.guidance?.techniques ?? [],
            w3cUnderstanding: f.w3c?.understanding,
        };
    });
    return {
        meta: report.meta,
        w3c: report.w3cReferences,
        principles,
        wcag22NewCriteria,
        topFindings,
    };
}
//# sourceMappingURL=context.js.map