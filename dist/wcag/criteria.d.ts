import type { WcagLevel, WcagVersion } from '../types';
export type WcagCriterion = {
    id: string;
    title: string;
    slug: string;
    level: 'A' | 'AA' | 'AAA';
    principle: string;
    guideline: string;
    introducedIn?: WcagVersion;
    obsoleteIn?: WcagVersion;
};
/**
 * WCAG 2.2 success criteria through level AA.
 * Sourced from W3C WCAG 2.2 — https://www.w3.org/WAI/standards-guidelines/wcag/
 */
export declare const WCAG_22_CRITERIA: WcagCriterion[];
export declare function getCriterion(id: string): WcagCriterion | undefined;
export declare function getCriteriaForTarget(version: WcagVersion, level: WcagLevel): WcagCriterion[];
//# sourceMappingURL=criteria.d.ts.map