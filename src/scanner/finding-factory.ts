import type { AuditFinding, AuditorConfig, Impact, PageVariant } from '../types';
import { getCriterion } from '../wcag/criteria';
import { buildW3cLinks } from '../wcag/urls';

type FindingInput = {
  rule: string;
  summary: string;
  description: string;
  selector: string;
  criteria: string[];
  impact: Impact;
  remediation: string;
  needsManualReview?: boolean;
  helpUrl?: string;
};

export function createFinding(
  config: AuditorConfig,
  ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
    source: AuditFinding['source'];
  },
  detail: FindingInput,
): AuditFinding {
  const primary = detail.criteria[0];
  const criterion = primary ? getCriterion(primary) : undefined;
  const w3c = criterion ? buildW3cLinks(criterion.id, criterion.slug, config.wcag.version) : undefined;

  return {
    id: `${detail.rule}-${ctx.route}-${ctx.variant}-${detail.selector}`.replace(/\s+/g, '-'),
    wcag: {
      version: config.wcag.version,
      criteria: detail.criteria,
      level: config.wcag.level,
    },
    impact: detail.impact,
    rule: detail.rule,
    summary: detail.summary,
    description: detail.description,
    helpUrl: detail.helpUrl ?? w3c?.quickRef ?? 'https://www.w3.org/WAI/WCAG22/quickref/',
    selector: detail.selector,
    remediation: detail.remediation,
    needsManualReview: detail.needsManualReview ?? false,
    route: ctx.route,
    routeName: ctx.routeName,
    variant: ctx.variant,
    scenario: ctx.scenario,
    source: ctx.source,
    criterionTitle: criterion?.title,
    w3c,
  };
}
