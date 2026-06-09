"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBaselineReport = loadBaselineReport;
exports.compareWithBaseline = compareWithBaseline;
const fs_1 = require("fs");
const path_1 = require("path");
function findingFingerprint(f) {
    return `${f.rule}|${f.wcag.criteria.join(',')}|${f.selector}|${f.route}`;
}
function loadBaselineReport(cwd, baselinePath) {
    const path = (0, path_1.resolve)(cwd, baselinePath ?? './a11y-reports/report.json');
    if (!(0, fs_1.existsSync)(path)) {
        return null;
    }
    try {
        return JSON.parse((0, fs_1.readFileSync)(path, 'utf-8'));
    }
    catch {
        return null;
    }
}
function compareWithBaseline(current, baseline) {
    if (!baseline) {
        return undefined;
    }
    const currentViolations = current.findings.filter((f) => !f.needsManualReview && !f.waived);
    const baselineViolations = baseline.findings.filter((f) => !f.needsManualReview && !f.waived);
    const currentKeys = new Map(currentViolations.map((f) => [findingFingerprint(f), f]));
    const baselineKeys = new Map(baselineViolations.map((f) => [findingFingerprint(f), f]));
    const newFindings = currentViolations.filter((f) => !baselineKeys.has(findingFingerprint(f)));
    const fixedFindings = baselineViolations.filter((f) => !currentKeys.has(findingFingerprint(f)));
    const regressed = current.summary.violations > baseline.summary.violations && newFindings.length > fixedFindings.length;
    return {
        baselineTimestamp: baseline.meta.timestamp,
        newCount: newFindings.length,
        fixedCount: fixedFindings.length,
        violationDelta: current.summary.violations - baseline.summary.violations,
        regressed,
        newFindings: newFindings.slice(0, 20),
        fixedFindings: fixedFindings.slice(0, 20),
    };
}
//# sourceMappingURL=baseline.js.map