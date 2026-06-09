import type { AuditFinding, AuditorConfig, ChecklistItem, ChecklistStatus } from '../types';
import { getCriteriaForTarget } from './criteria';
import { buildW3cLinks } from './urls';

export type { ChecklistItem, ChecklistStatus };

function collectCriteriaFromFindings(
  findings: AuditFinding[],
  predicate: (f: AuditFinding) => boolean,
): Map<string, number> {
  const counts = new Map<string, number>();

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

export function buildWcagChecklist(
  config: AuditorConfig,
  findings: AuditFinding[],
  passedCriteria: Set<string>,
): ChecklistItem[] {
  const version = config.wcag.version;
  const criteria = getCriteriaForTarget(version, config.wcag.level);

  const failures = collectCriteriaFromFindings(findings, (f) => !f.needsManualReview);
  const incompletes = collectCriteriaFromFindings(findings, (f) => f.needsManualReview);

  return criteria.map((criterion) => {
    let status: ChecklistStatus = 'needs-manual-review';
    const failureCount = failures.get(criterion.id) ?? 0;
    const incompleteCount = incompletes.get(criterion.id) ?? 0;

    if (failureCount > 0) {
      status = 'failed';
    } else if (incompleteCount > 0) {
      status = 'incomplete';
    } else if (passedCriteria.has(criterion.id)) {
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
      w3c: buildW3cLinks(criterion.id, criterion.slug, version),
      findingCount: failureCount + incompleteCount,
    };
  });
}

export type ChecklistSummary = {
  total: number;
  failed: number;
  incomplete: number;
  automatedPass: number;
  needsManualReview: number;
};

export function summarizeChecklist(checklist: ChecklistItem[]): ChecklistSummary {
  return {
    total: checklist.length,
    failed: checklist.filter((c) => c.status === 'failed').length,
    incomplete: checklist.filter((c) => c.status === 'incomplete').length,
    automatedPass: checklist.filter((c) => c.status === 'automated-pass').length,
    needsManualReview: checklist.filter((c) => c.status === 'needs-manual-review').length,
  };
}
