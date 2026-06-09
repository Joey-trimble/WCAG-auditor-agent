import type { AuditFinding, AuditorConfig } from '../types';
export type StaticAnalysisResult = {
    findings: AuditFinding[];
    filesScanned: number;
    warnings: string[];
};
export declare function runStaticAnalysis(cwd: string, config: AuditorConfig): StaticAnalysisResult;
//# sourceMappingURL=static.d.ts.map