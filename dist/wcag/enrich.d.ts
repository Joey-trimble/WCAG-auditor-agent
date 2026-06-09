import type { AuditFinding, ChecklistItem, WcagVersion } from '../types';
export declare function enrichFinding(finding: AuditFinding, version: WcagVersion): AuditFinding;
export declare function enrichFindings(findings: AuditFinding[], version: WcagVersion): AuditFinding[];
export declare function enrichChecklistItem(item: ChecklistItem): ChecklistItem;
export declare function enrichChecklist(checklist: ChecklistItem[]): ChecklistItem[];
//# sourceMappingURL=enrich.d.ts.map