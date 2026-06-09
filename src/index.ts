export { audit, auditUrl } from './audit';
export { loadConfig, mergeConfig, getWcagTags, evaluateThresholds, findConfigPath } from './config';
export { writeReports, writeJsonReport, writeHtmlReport } from './report';
export { runBehavioralChecks, runCrossPageChecks, extractNavSignature } from './scanner/behavioral';
export { buildWcagChecklist, summarizeChecklist } from './wcag/checklist';
export { getCriteriaForTarget, getCriterion, WCAG_22_CRITERIA } from './wcag/criteria';
export {
  WCAG_PRINCIPLES,
  WCAG_22_ONLY_CRITERIA_IDS,
  formatCriterionHierarchy,
  isWcag22OnlyCriterion,
  summarizeChecklistByPrinciple,
} from './wcag/hierarchy';
export { buildWcagContext } from './wcag/context';
export { enrichFindings, enrichFinding, enrichChecklist } from './wcag/enrich';
export { getPlaybookEntry, getPlaybookExport } from './wcag/playbook';
export { generateAgentReviewBrief } from './agent/review-brief';
export { loadWaivers, applyWaivers, getActiveWaivers, getExpiredWaivers } from './waivers';
export { writeSarifReport, buildSarifReport } from './report/sarif';
export { buildW3cLinks, getReportW3cReferences } from './wcag/urls';
export type {
  AuditorConfig,
  AuditReport,
  AuditFinding,
  AuditOptions,
  RouteConfig,
  ScenarioConfig,
  WcagLevel,
  WcagVersion,
  Impact,
  PageVariant,
  ReportFormat,
  W3cLinks,
  ChecklistItem,
  ChecklistStatus,
  ChecklistSummary,
  CriterionGuidance,
  WaiverEntry,
} from './types';
