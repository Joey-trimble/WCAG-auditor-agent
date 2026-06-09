import type { AuditReport, BaselineDiff } from '../types';
export declare function loadBaselineReport(cwd: string, baselinePath?: string): AuditReport | null;
export declare function compareWithBaseline(current: AuditReport, baseline: AuditReport | null): BaselineDiff | undefined;
//# sourceMappingURL=baseline.d.ts.map