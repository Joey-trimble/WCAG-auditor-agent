import type { AuditReport, ChecklistItem } from '../types';
import { type PrincipleGroup } from './hierarchy';
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
export declare function buildWcagContext(report: AuditReport): WcagContextExport;
//# sourceMappingURL=context.d.ts.map