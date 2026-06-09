import type { AuditFinding, AuditorConfig, ChecklistItem, ChecklistStatus } from '../types';
export type { ChecklistItem, ChecklistStatus };
export declare function buildWcagChecklist(config: AuditorConfig, findings: AuditFinding[], passedCriteria: Set<string>): ChecklistItem[];
export type ChecklistSummary = {
    total: number;
    failed: number;
    incomplete: number;
    automatedPass: number;
    needsManualReview: number;
};
export declare function summarizeChecklist(checklist: ChecklistItem[]): ChecklistSummary;
//# sourceMappingURL=checklist.d.ts.map