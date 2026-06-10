import type {
  AuditFinding,
  FindingConfidence,
  FindingEffort,
  FindingGroup,
  Impact,
} from '../types';

const IMPACT_ORDER: Impact[] = ['critical', 'serious', 'moderate', 'minor'];

function groupKey(finding: AuditFinding): string {
  const criterionId = finding.wcag.criteria.find((id) => id !== 'unknown') ?? 'unknown';
  return `${finding.rule}::${criterionId}`;
}

function inferConfidence(instances: AuditFinding[]): FindingConfidence {
  if (instances.some((f) => f.needsManualReview)) {
    return 'manual-required';
  }
  if (instances.some((f) => f.source === 'behavioral' || f.source === 'keyboard')) {
    return 'heuristic';
  }
  return 'high-confidence-automated';
}

function inferEffort(instances: AuditFinding[]): FindingEffort {
  const hasCodePath = instances.some((f) => Boolean(f.filePath));
  if (instances.length >= 8) {
    return 'L';
  }
  if (instances.length >= 4 || !hasCodePath) {
    return 'M';
  }
  return 'S';
}

function inferSuggestedOwner(instances: AuditFinding[]): string {
  const sources = new Set(instances.map((f) => f.source));
  if (sources.has('static')) {
    return 'Frontend Engineering';
  }
  if (sources.has('behavioral') || sources.has('keyboard')) {
    return 'UX Engineering';
  }
  return 'Accessibility Champion';
}

function inferRouteRisk(routes: string[]): 'high' | 'medium' | 'low' {
  const highRiskPattern = /(login|signin|checkout|payment|billing|account|profile|auth)/i;
  if (routes.some((r) => highRiskPattern.test(r))) {
    return 'high';
  }
  if (routes.length >= 3) {
    return 'medium';
  }
  return 'low';
}

function buildAcceptanceCriteria(sample: AuditFinding): string {
  const criterion = sample.wcag.criteria.find((id) => id !== 'unknown') ?? 'WCAG';
  if (sample.source === 'static' && sample.filePath) {
    return `All ${sample.rule} findings resolved in source files and re-validated by lint + audit (${criterion}).`;
  }
  return `No remaining ${sample.rule} violations across affected routes and manual verification completed for ${criterion}.`;
}

export function groupFindings(findings: AuditFinding[]): FindingGroup[] {
  const buckets = new Map<string, AuditFinding[]>();

  for (const finding of findings) {
    const key = groupKey(finding);
    const list = buckets.get(key) ?? [];
    list.push(finding);
    buckets.set(key, list);
  }

  const groups: FindingGroup[] = [];

  for (const [key, instances] of buckets) {
    const sample = instances[0];
    const criterionId = sample.wcag.criteria.find((id) => id !== 'unknown') ?? 'unknown';
    const routes = [...new Set(instances.map((f) => f.route))];
    const selectors = [...new Set(instances.map((f) => f.selector))];
    const sources = [...new Set(instances.map((f) => f.source))];
    const filePaths = [
      ...new Set(instances.map((f) => f.filePath).filter((p): p is string => Boolean(p))),
    ];

    groups.push({
      key,
      rule: sample.rule,
      criterionId,
      criterionTitle: sample.criterionTitle,
      impact: sample.impact,
      summary: sample.summary,
      instanceCount: instances.length,
      routes,
      selectors,
      sources,
      filePaths,
      confidence: inferConfidence(instances),
      estimatedEffort: inferEffort(instances),
      suggestedOwner: inferSuggestedOwner(instances),
      routeRisk: inferRouteRisk(routes),
      acceptanceCriteria: buildAcceptanceCriteria(sample),
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
