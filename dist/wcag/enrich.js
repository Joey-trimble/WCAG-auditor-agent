"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichFinding = enrichFinding;
exports.enrichFindings = enrichFindings;
exports.enrichChecklistItem = enrichChecklistItem;
exports.enrichChecklist = enrichChecklist;
const criteria_1 = require("./criteria");
const playbook_1 = require("./playbook");
const urls_1 = require("./urls");
function enrichFinding(finding, version) {
    const primaryCriterion = finding.wcag.criteria.find((id) => id !== 'unknown') ?? finding.wcag.criteria[0];
    const criterion = (0, criteria_1.getCriterion)(primaryCriterion);
    if (!criterion) {
        return finding;
    }
    return {
        ...finding,
        criterionTitle: criterion.title,
        w3c: (0, urls_1.buildW3cLinks)(criterion.id, criterion.slug, version),
        guidance: (0, playbook_1.getPlaybookEntry)(criterion.id, criterion.title),
    };
}
function enrichFindings(findings, version) {
    return findings.map((f) => enrichFinding(f, version));
}
function enrichChecklistItem(item) {
    return {
        ...item,
        guidance: (0, playbook_1.getPlaybookEntry)(item.id, item.title),
    };
}
function enrichChecklist(checklist) {
    return checklist.map(enrichChecklistItem);
}
//# sourceMappingURL=enrich.js.map