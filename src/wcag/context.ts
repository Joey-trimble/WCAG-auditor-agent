import type { AuditFinding, AuditReport, ChecklistItem } from '../types';
import {
  formatCriterionHierarchy,
  isWcag22OnlyCriterion,
  summarizeChecklistByPrinciple,
  type PrincipleGroup,
} from './hierarchy';
import { getPlaybookEntry } from './playbook';

export type WcagContextCriterion = {
  id: string;
  title: string;
  level: string;
  principle: string;
  guideline: string;
  hierarchy: string;
  status: string;
  isWcag22Only: boolean;
  introducedIn?: string;
  findingCount: number;
  w3c: ChecklistItem['w3c'];
  guidance: ChecklistItem['guidance'];
  findings: Array<{
    id: string;
    impact: string;
    rule: string;
    source: string;
    selector: string;
    route: string;
    summary: string;
    waived?: boolean;
  }>;
};

export type WcagContextExport = {
  meta: AuditReport['meta'];
  w3c: AuditReport['w3cReferences'];
  principles: Array<{
    principle: string;
    summary: PrincipleGroup['summary'];
    guidelines: Array<{
      id: string;
      title: string;
      criteria: WcagContextCriterion[];
    }>;
  }>;
  wcag22NewCriteria: WcagContextCriterion[];
  topFindings: Array<{
    hierarchy: string;
    impact: string;
    rule: string;
    selector: string;
    route: string;
    summary: string;
    techniques: string[];
    w3cUnderstanding?: string;
  }>;
};

function toContextCriterion(
  item: ChecklistItem,
  findings: AuditFinding[],
): WcagContextCriterion {
  const guidance = item.guidance ?? getPlaybookEntry(item.id, item.title);
  return {
    id: item.id,
    title: item.title,
    level: item.level,
    principle: item.principle,
    guideline: item.guideline,
    hierarchy: formatCriterionHierarchy(item),
    status: item.status,
    isWcag22Only: isWcag22OnlyCriterion(item.id),
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

export function buildWcagContext(report: AuditReport): WcagContextExport {
  const checklist = report.wcagChecklist ?? [];
  const principleGroups = summarizeChecklistByPrinciple(checklist);

  const findingsByCriterion = new Map<string, AuditFinding[]>();
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
        .filter((item): item is ChecklistItem => Boolean(item))
        .map((item) => toContextCriterion(item, findingsByCriterion.get(item.id) ?? [])),
    })),
  }));

  const wcag22NewCriteria = checklist
    .filter((item) => isWcag22OnlyCriterion(item.id))
    .map((item) => toContextCriterion(item, findingsByCriterion.get(item.id) ?? []));

  const topFindings = report.findings
    .filter((f) => !f.needsManualReview && !f.waived)
    .slice(0, 20)
    .map((f) => {
      const criterionId = f.wcag.criteria.find((id) => id !== 'unknown');
      const checklistItem = criterionId ? checklist.find((c) => c.id === criterionId) : undefined;
      const hierarchy = checklistItem
        ? formatCriterionHierarchy(checklistItem)
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
