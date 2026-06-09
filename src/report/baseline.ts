import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { AuditFinding, AuditReport, BaselineDiff } from '../types';

function findingFingerprint(f: AuditFinding): string {
  return `${f.rule}|${f.wcag.criteria.join(',')}|${f.selector}|${f.route}`;
}

export function loadBaselineReport(cwd: string, baselinePath?: string): AuditReport | null {
  const path = resolve(cwd, baselinePath ?? './a11y-reports/report.json');
  if (!existsSync(path)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as AuditReport;
  } catch {
    return null;
  }
}

export function compareWithBaseline(
  current: AuditReport,
  baseline: AuditReport | null,
): BaselineDiff | undefined {
  if (!baseline) {
    return undefined;
  }

  const currentViolations = current.findings.filter((f) => !f.needsManualReview && !f.waived);
  const baselineViolations = baseline.findings.filter((f) => !f.needsManualReview && !f.waived);

  const currentKeys = new Map(currentViolations.map((f) => [findingFingerprint(f), f]));
  const baselineKeys = new Map(baselineViolations.map((f) => [findingFingerprint(f), f]));

  const newFindings = currentViolations.filter((f) => !baselineKeys.has(findingFingerprint(f)));
  const fixedFindings = baselineViolations.filter((f) => !currentKeys.has(findingFingerprint(f)));
  const regressed =
    current.summary.violations > baseline.summary.violations && newFindings.length > fixedFindings.length;

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
