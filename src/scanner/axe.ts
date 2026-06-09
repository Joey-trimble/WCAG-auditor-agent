import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { Result, NodeResult } from 'axe-core';
import { getWcagTags } from '../config';
import type { AuditFinding, AuditorConfig, Impact, PageVariant } from '../types';

const IMPACT_ORDER: Impact[] = ['critical', 'serious', 'moderate', 'minor'];

function normalizeImpact(impact?: string | null): Impact {
  if (impact && IMPACT_ORDER.includes(impact as Impact)) {
    return impact as Impact;
  }
  return 'moderate';
}

function extractWcagCriteria(tags: string[]): string[] {
  return tags
    .filter((tag) => /^wcag\d{3}$/.test(tag) || /^wcag\d{4}$/.test(tag))
    .map((tag) => {
      const match = tag.match(/^wcag(\d)(\d)(\d)$/);
      if (match) {
        return `${match[1]}.${match[2]}.${match[3]}`;
      }
      return tag;
    });
}

function nodeToFinding(
  rule: Result,
  node: NodeResult,
  ctx: {
    config: AuditorConfig;
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
    needsManualReview: boolean;
  },
): AuditFinding {
  const criteria = extractWcagCriteria(rule.tags);
  const selector = node.target.join(' > ');

  return {
    id: `${rule.id}-${selector}-${ctx.variant}-${ctx.scenario ?? 'base'}`,
    wcag: {
      version: ctx.config.wcag.version,
      criteria: criteria.length ? criteria : ['unknown'],
      level: ctx.config.wcag.level,
    },
    impact: normalizeImpact(rule.impact),
    rule: rule.id,
    summary: rule.help,
    description: node.failureSummary ?? rule.description,
    helpUrl: rule.helpUrl,
    selector,
    html: node.html,
    remediation: rule.help,
    needsManualReview: ctx.needsManualReview,
    route: ctx.route,
    routeName: ctx.routeName,
    variant: ctx.variant,
    scenario: ctx.scenario,
    source: 'axe',
  };
}

export async function runAxeScan(
  page: Page,
  config: AuditorConfig,
  ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
  },
): Promise<AuditFinding[]> {
  const tags = getWcagTags(config.wcag.version, config.wcag.level);

  let builder = new AxeBuilder({ page }).withTags(tags);

  if (config.axe?.disableRules?.length) {
    builder = builder.disableRules(config.axe.disableRules);
  }
  if (config.axe?.include?.length) {
    builder = builder.include(config.axe.include);
  }
  if (config.axe?.exclude?.length) {
    builder = builder.exclude(config.axe.exclude);
  }

  const results = await builder.analyze();
  const findings: AuditFinding[] = [];

  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      findings.push(
        nodeToFinding(violation, node, {
          config,
          route: ctx.route,
          routeName: ctx.routeName,
          variant: ctx.variant,
          scenario: ctx.scenario,
          needsManualReview: false,
        }),
      );
    }
  }

  for (const incomplete of results.incomplete) {
    for (const node of incomplete.nodes) {
      findings.push(
        nodeToFinding(incomplete, node, {
          config,
          route: ctx.route,
          routeName: ctx.routeName,
          variant: ctx.variant,
          scenario: ctx.scenario,
          needsManualReview: true,
        }),
      );
    }
  }

  return findings;
}

export async function countAxePasses(page: Page, config: AuditorConfig): Promise<number> {
  const tags = getWcagTags(config.wcag.version, config.wcag.level);
  let builder = new AxeBuilder({ page }).withTags(tags);

  if (config.axe?.disableRules?.length) {
    builder = builder.disableRules(config.axe.disableRules);
  }

  const results = await builder.analyze();
  return results.passes.length;
}
