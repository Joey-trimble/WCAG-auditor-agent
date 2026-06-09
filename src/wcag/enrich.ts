import type { AuditFinding, WcagVersion } from '../types';
import { getCriterion } from './criteria';
import { buildW3cLinks } from './urls';

export function enrichFinding(finding: AuditFinding, version: WcagVersion): AuditFinding {
  const primaryCriterion = finding.wcag.criteria.find((id) => id !== 'unknown') ?? finding.wcag.criteria[0];
  const criterion = getCriterion(primaryCriterion);

  if (!criterion) {
    return finding;
  }

  return {
    ...finding,
    criterionTitle: criterion.title,
    w3c: buildW3cLinks(criterion.id, criterion.slug, version),
  };
}

export function enrichFindings(findings: AuditFinding[], version: WcagVersion): AuditFinding[] {
  return findings.map((f) => enrichFinding(f, version));
}
