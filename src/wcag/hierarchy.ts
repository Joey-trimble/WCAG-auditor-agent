import type { ChecklistItem, WcagVersion } from '../types';
import { WCAG_22_CRITERIA, type WcagCriterion } from './criteria';

export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';

export const WCAG_PRINCIPLES: WcagPrinciple[] = [
  'Perceivable',
  'Operable',
  'Understandable',
  'Robust',
];

/** Success criteria introduced in WCAG 2.2 (not in 2.0/2.1). */
export const WCAG_22_ONLY_CRITERIA_IDS = WCAG_22_CRITERIA.filter(
  (c) => c.introducedIn === '2.2',
).map((c) => c.id);

export function isWcag22OnlyCriterion(id: string): boolean {
  return WCAG_22_ONLY_CRITERIA_IDS.includes(id);
}

export function parseGuidelineId(guideline: string): string {
  const match = guideline.match(/^(\d+\.\d+)/);
  return match?.[1] ?? guideline;
}

export type GuidelineGroup = {
  id: string;
  title: string;
  principle: WcagPrinciple;
  criteria: WcagCriterion[];
};

export type PrincipleGroup = {
  principle: WcagPrinciple;
  guidelines: GuidelineGroup[];
  summary: {
    total: number;
    failed: number;
    incomplete: number;
    automatedPass: number;
    needsManualReview: number;
  };
};

export function groupCriteriaByPrinciple(criteria: WcagCriterion[]): PrincipleGroup[] {
  const byPrinciple = new Map<WcagPrinciple, Map<string, GuidelineGroup>>();

  for (const criterion of criteria) {
    const principle = criterion.principle as WcagPrinciple;
    const guidelineId = parseGuidelineId(criterion.guideline);

    if (!byPrinciple.has(principle)) {
      byPrinciple.set(principle, new Map());
    }

    const guidelines = byPrinciple.get(principle)!;
    if (!guidelines.has(guidelineId)) {
      guidelines.set(guidelineId, {
        id: guidelineId,
        title: criterion.guideline.replace(/^\d+\.\d+\s*/, ''),
        principle,
        criteria: [],
      });
    }

    guidelines.get(guidelineId)!.criteria.push(criterion);
  }

  return WCAG_PRINCIPLES.map((principle) => {
    const guidelines = byPrinciple.get(principle);
    return {
      principle,
      guidelines: guidelines ? [...guidelines.values()] : [],
      summary: { total: 0, failed: 0, incomplete: 0, automatedPass: 0, needsManualReview: 0 },
    };
  }).filter((p) => p.guidelines.length > 0);
}

export function summarizeChecklistByPrinciple(checklist: ChecklistItem[]): PrincipleGroup[] {
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
        } else if (item.status === 'incomplete') {
          group.summary.incomplete++;
        } else if (item.status === 'automated-pass') {
          group.summary.automatedPass++;
        } else if (item.status === 'needs-manual-review') {
          group.summary.needsManualReview++;
        }
      }
    }
  }

  return groups;
}

export function formatCriterionHierarchy(item: {
  principle: string;
  guideline: string;
  id: string;
  title: string;
  introducedIn?: WcagVersion;
}): string {
  const guidelineId = parseGuidelineId(item.guideline);
  const wcag22 = item.introducedIn === '2.2' ? ' *(WCAG 2.2)*' : '';
  return `${item.principle} → ${guidelineId} ${item.guideline.replace(/^\d+\.\d+\s*/, '')} → **${item.id}** ${item.title}${wcag22}`;
}
