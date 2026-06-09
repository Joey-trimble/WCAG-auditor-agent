export type WcagLevel = 'A' | 'AA' | 'AAA';
export type WcagVersion = '2.1' | '2.2';
export type Impact = 'critical' | 'serious' | 'moderate' | 'minor';
export type ReportFormat = 'json' | 'html';
export type PageVariant = 'default' | 'dark' | 'zoom-200' | 'reduced-motion';

export type RouteConfig = {
  path: string;
  name?: string;
  auth?: string;
};

export type AuthProfile = {
  storageState: string;
};

export type ScenarioConfig = {
  name: string;
  route: string;
  steps: string[];
  auth?: string;
};

export type AuditorConfig = {
  wcag: {
    version: WcagVersion;
    level: WcagLevel;
  };
  baseUrl: string;
  routes: RouteConfig[];
  auth?: {
    profiles: Record<string, AuthProfile>;
  };
  scenarios?: ScenarioConfig[];
  variants?: PageVariant[];
  thresholds?: {
    failOn?: Impact[];
    maxViolations?: number;
  };
  axe?: {
    disableRules?: string[];
    include?: string[];
    exclude?: string[];
  };
  output?: {
    dir?: string;
    formats?: ReportFormat[];
  };
};

export type W3cLinks = {
  overview: string;
  understanding: string;
  quickRef: string;
};

export type ChecklistStatus =
  | 'failed'
  | 'incomplete'
  | 'automated-pass'
  | 'needs-manual-review';

export type ChecklistItem = {
  id: string;
  title: string;
  level: 'A' | 'AA' | 'AAA';
  principle: string;
  guideline: string;
  status: ChecklistStatus;
  introducedIn?: WcagVersion;
  w3c: W3cLinks;
  findingCount: number;
};

export type ChecklistSummary = {
  total: number;
  failed: number;
  incomplete: number;
  automatedPass: number;
  needsManualReview: number;
};

export type AuditFinding = {
  id: string;
  wcag: {
    version: WcagVersion;
    criteria: string[];
    level: WcagLevel;
  };
  impact: Impact;
  rule: string;
  summary: string;
  description: string;
  helpUrl: string;
  selector: string;
  html?: string;
  remediation: string;
  needsManualReview: boolean;
  route: string;
  routeName?: string;
  variant: PageVariant;
  scenario?: string;
  source: 'axe' | 'keyboard';
  criterionTitle?: string;
  w3c?: W3cLinks;
};

export type RouteResult = {
  path: string;
  name?: string;
  url: string;
  variant: PageVariant;
  scenario?: string;
  violationCount: number;
  incompleteCount: number;
  passCount: number;
};

export type AuditReport = {
  meta: {
    tool: string;
    version: string;
    wcag: { version: WcagVersion; level: WcagLevel };
    timestamp: string;
    baseUrl: string;
  };
  summary: {
    routesScanned: number;
    violations: number;
    incomplete: number;
    passes: number;
    byImpact: Record<Impact, number>;
    passed: boolean;
  };
  findings: AuditFinding[];
  routes: RouteResult[];
  keyboardAudit?: {
    focusOrder: string[];
    issues: string[];
  };
  wcagChecklist?: ChecklistItem[];
  checklistSummary?: ChecklistSummary;
  w3cReferences?: W3cLinks;
};

export type AuditOptions = Partial<AuditorConfig> & {
  configPath?: string;
  cwd?: string;
};
