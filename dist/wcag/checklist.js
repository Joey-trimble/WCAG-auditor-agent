"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWcagChecklist = buildWcagChecklist;
exports.summarizeChecklist = summarizeChecklist;
const criteria_1 = require("./criteria");
const urls_1 = require("./urls");
function collectCriteriaFromFindings(findings, predicate) {
    const counts = new Map();
    for (const finding of findings.filter(predicate)) {
        for (const criterionId of finding.wcag.criteria) {
            if (criterionId === 'unknown') {
                continue;
            }
            counts.set(criterionId, (counts.get(criterionId) ?? 0) + 1);
        }
    }
    return counts;
}
function buildWcagChecklist(config, findings, passedCriteria) {
    const version = config.wcag.version;
    const criteria = (0, criteria_1.getCriteriaForTarget)(version, config.wcag.level);
    const failures = collectCriteriaFromFindings(findings, (f) => !f.needsManualReview);
    const incompletes = collectCriteriaFromFindings(findings, (f) => f.needsManualReview);
    return criteria.map((criterion) => {
        let status = 'needs-manual-review';
        const failureCount = failures.get(criterion.id) ?? 0;
        const incompleteCount = incompletes.get(criterion.id) ?? 0;
        if (failureCount > 0) {
            status = 'failed';
        }
        else if (incompleteCount > 0) {
            status = 'incomplete';
        }
        else if (passedCriteria.has(criterion.id)) {
            status = 'automated-pass';
        }
        return {
            id: criterion.id,
            title: criterion.title,
            level: criterion.level,
            principle: criterion.principle,
            guideline: criterion.guideline,
            status,
            introducedIn: criterion.introducedIn,
            w3c: (0, urls_1.buildW3cLinks)(criterion.id, criterion.slug, version),
            findingCount: failureCount + incompleteCount,
        };
    });
}
function summarizeChecklist(checklist) {
    return {
        total: checklist.length,
        failed: checklist.filter((c) => c.status === 'failed').length,
        incomplete: checklist.filter((c) => c.status === 'incomplete').length,
        automatedPass: checklist.filter((c) => c.status === 'automated-pass').length,
        needsManualReview: checklist.filter((c) => c.status === 'needs-manual-review').length,
    };
}
//# sourceMappingURL=checklist.js.map