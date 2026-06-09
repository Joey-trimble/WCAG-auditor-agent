"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupFindings = groupFindings;
const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];
function groupKey(finding) {
    const criterionId = finding.wcag.criteria.find((id) => id !== 'unknown') ?? 'unknown';
    return `${finding.rule}::${criterionId}`;
}
function groupFindings(findings) {
    const buckets = new Map();
    for (const finding of findings) {
        const key = groupKey(finding);
        const list = buckets.get(key) ?? [];
        list.push(finding);
        buckets.set(key, list);
    }
    const groups = [];
    for (const [key, instances] of buckets) {
        const sample = instances[0];
        const criterionId = sample.wcag.criteria.find((id) => id !== 'unknown') ?? 'unknown';
        groups.push({
            key,
            rule: sample.rule,
            criterionId,
            criterionTitle: sample.criterionTitle,
            impact: sample.impact,
            summary: sample.summary,
            instanceCount: instances.length,
            routes: [...new Set(instances.map((f) => f.route))],
            selectors: [...new Set(instances.map((f) => f.selector))],
            sources: [...new Set(instances.map((f) => f.source))],
            filePaths: [
                ...new Set(instances.map((f) => f.filePath).filter((p) => Boolean(p))),
            ],
            instances,
        });
    }
    return groups.sort((a, b) => {
        const impactDiff = IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact);
        if (impactDiff !== 0) {
            return impactDiff;
        }
        return b.instanceCount - a.instanceCount;
    });
}
//# sourceMappingURL=grouping.js.map