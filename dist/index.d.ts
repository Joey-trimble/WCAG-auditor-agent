export { audit, auditUrl } from './audit';
export { loadConfig, mergeConfig, getWcagTags, evaluateThresholds, findConfigPath } from './config';
export { writeReports, writeJsonReport, writeHtmlReport } from './report';
export { runBehavioralChecks, runCrossPageChecks, extractNavSignature } from './scanner/behavioral';
export { buildWcagChecklist, summarizeChecklist } from './wcag/checklist';
export { getCriteriaForTarget, getCriterion, WCAG_22_CRITERIA } from './wcag/criteria';
export { enrichFindings, enrichFinding } from './wcag/enrich';
export { buildW3cLinks, getReportW3cReferences } from './wcag/urls';
export type { AuditorConfig, AuditReport, AuditFinding, AuditOptions, RouteConfig, ScenarioConfig, WcagLevel, WcagVersion, Impact, PageVariant, ReportFormat, W3cLinks, ChecklistItem, ChecklistStatus, ChecklistSummary, } from './types';
//# sourceMappingURL=index.d.ts.map