import type { ChecklistItem, WcagVersion } from '../types';
import { type WcagCriterion } from './criteria';
export type WcagPrinciple = 'Perceivable' | 'Operable' | 'Understandable' | 'Robust';
export declare const WCAG_PRINCIPLES: WcagPrinciple[];
/** Success criteria introduced in WCAG 2.2 (not in 2.0/2.1). */
export declare const WCAG_22_ONLY_CRITERIA_IDS: string[];
export declare function isWcag22OnlyCriterion(id: string): boolean;
export declare function parseGuidelineId(guideline: string): string;
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
export declare function groupCriteriaByPrinciple(criteria: WcagCriterion[]): PrincipleGroup[];
export declare function summarizeChecklistByPrinciple(checklist: ChecklistItem[]): PrincipleGroup[];
export declare function formatCriterionHierarchy(item: {
    principle: string;
    guideline: string;
    id: string;
    title: string;
    introducedIn?: WcagVersion;
}): string;
//# sourceMappingURL=hierarchy.d.ts.map