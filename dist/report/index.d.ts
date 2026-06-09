import type { AuditReport, AuditorConfig } from '../types';
export declare function writeReports(report: AuditReport, config: AuditorConfig, cwd: string): Promise<string[]>;
export { writeJsonReport } from './json';
export { writeHtmlReport } from './html';
export { writeAgentReviewBrief } from './review';
export { generateAgentReviewBrief } from '../agent/review-brief';
//# sourceMappingURL=index.d.ts.map