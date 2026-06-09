"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WCAG_22_ONLY_CRITERIA_IDS = exports.WCAG_PRINCIPLES = void 0;
exports.isWcag22OnlyCriterion = isWcag22OnlyCriterion;
exports.parseGuidelineId = parseGuidelineId;
exports.groupCriteriaByPrinciple = groupCriteriaByPrinciple;
exports.summarizeChecklistByPrinciple = summarizeChecklistByPrinciple;
exports.formatCriterionHierarchy = formatCriterionHierarchy;
const criteria_1 = require("./criteria");
exports.WCAG_PRINCIPLES = [
    'Perceivable',
    'Operable',
    'Understandable',
    'Robust',
];
/** Success criteria introduced in WCAG 2.2 (not in 2.0/2.1). */
exports.WCAG_22_ONLY_CRITERIA_IDS = criteria_1.WCAG_22_CRITERIA.filter((c) => c.introducedIn === '2.2').map((c) => c.id);
function isWcag22OnlyCriterion(id) {
    return exports.WCAG_22_ONLY_CRITERIA_IDS.includes(id);
}
function parseGuidelineId(guideline) {
    const match = guideline.match(/^(\d+\.\d+)/);
    return match?.[1] ?? guideline;
}
function groupCriteriaByPrinciple(criteria) {
    const byPrinciple = new Map();
    for (const criterion of criteria) {
        const principle = criterion.principle;
        const guidelineId = parseGuidelineId(criterion.guideline);
        if (!byPrinciple.has(principle)) {
            byPrinciple.set(principle, new Map());
        }
        const guidelines = byPrinciple.get(principle);
        if (!guidelines.has(guidelineId)) {
            guidelines.set(guidelineId, {
                id: guidelineId,
                title: criterion.guideline.replace(/^\d+\.\d+\s*/, ''),
                principle,
                criteria: [],
            });
        }
        guidelines.get(guidelineId).criteria.push(criterion);
    }
    return exports.WCAG_PRINCIPLES.map((principle) => {
        const guidelines = byPrinciple.get(principle);
        return {
            principle,
            guidelines: guidelines ? [...guidelines.values()] : [],
            summary: { total: 0, failed: 0, incomplete: 0, automatedPass: 0, needsManualReview: 0 },
        };
    }).filter((p) => p.guidelines.length > 0);
}
function summarizeChecklistByPrinciple(checklist) {
    const criteria = checklist.map((item) => ({
        id: item.id,
        title: item.title,
        slug: '',
        level: item.level,
        principle: item.principle,
        guideline: item.guideline,
        introducedIn: item.introducedIn,
    }));
    const groups = groupCriteriaByPrinciple(criteria);
    for (const group of groups) {
        for (const guideline of group.guidelines) {
            for (const criterion of guideline.criteria) {
                const item = checklist.find((c) => c.id === criterion.id);
                if (!item) {
                    continue;
                }
                group.summary.total++;
                if (item.status === 'failed') {
                    group.summary.failed++;
                }
                else if (item.status === 'incomplete') {
                    group.summary.incomplete++;
                }
                else if (item.status === 'automated-pass') {
                    group.summary.automatedPass++;
                }
                else if (item.status === 'needs-manual-review') {
                    group.summary.needsManualReview++;
                }
            }
        }
    }
    return groups;
}
function formatCriterionHierarchy(item) {
    const guidelineId = parseGuidelineId(item.guideline);
    const wcag22 = item.introducedIn === '2.2' ? ' *(WCAG 2.2)*' : '';
    return `${item.principle} → ${guidelineId} ${item.guideline.replace(/^\d+\.\d+\s*/, '')} → **${item.id}** ${item.title}${wcag22}`;
}
//# sourceMappingURL=hierarchy.js.map