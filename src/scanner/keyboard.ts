import type { Page } from '@playwright/test';
import type { AuditFinding, AuditorConfig, PageVariant } from '../types';

export type KeyboardAuditResult = {
  focusOrder: string[];
  issues: string[];
  findings: AuditFinding[];
};

const MAX_TAB_STOPS = 50;

export async function runKeyboardAudit(
  page: Page,
  config: AuditorConfig,
  ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
  },
): Promise<KeyboardAuditResult> {
  const focusOrder: string[] = [];
  const issues: string[] = [];
  const findings: AuditFinding[] = [];
  const seen = new Set<string>();

  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  });

  for (let i = 0; i < MAX_TAB_STOPS; i++) {
    await page.keyboard.press('Tab');

    const focusInfo = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) {
        return null;
      }

      const htmlEl = el as HTMLElement;
      const selector =
        htmlEl.id
          ? `#${htmlEl.id}`
          : `${htmlEl.tagName.toLowerCase()}${htmlEl.className ? `.${htmlEl.className.split(' ').filter(Boolean).join('.')}` : ''}`;

      const rect = htmlEl.getBoundingClientRect();
      const style = window.getComputedStyle(htmlEl);
      const outlineVisible =
        style.outlineStyle !== 'none' &&
        style.outlineWidth !== '0px' &&
        style.outlineColor !== 'transparent';
      const boxShadow = style.boxShadow !== 'none';

      return {
        selector,
        tag: htmlEl.tagName.toLowerCase(),
        visible: rect.width > 0 && rect.height > 0,
        hasFocusIndicator: outlineVisible || boxShadow,
        ariaLabel: htmlEl.getAttribute('aria-label'),
        text: (htmlEl.textContent ?? '').trim().slice(0, 80),
      };
    });

    if (!focusInfo) {
      break;
    }

    const key = `${focusInfo.tag}:${focusInfo.selector}`;
    if (seen.has(key)) {
      issues.push(`Focus cycle detected at ${focusInfo.selector} (possible keyboard trap — WCAG 2.1.2)`);
      findings.push(
        createKeyboardFinding(config, ctx, {
          rule: 'keyboard-trap',
          summary: 'Possible keyboard trap or focus cycle',
          description: `Tab navigation returned to ${focusInfo.selector} after ${i + 1} stops.`,
          selector: focusInfo.selector,
          impact: 'serious',
          criteria: ['2.1.2'],
        }),
      );
      break;
    }

    seen.add(key);
    focusOrder.push(`${focusInfo.tag} ${focusInfo.selector}${focusInfo.text ? ` — "${focusInfo.text}"` : ''}`);

    if (focusInfo.visible && !focusInfo.hasFocusIndicator) {
      issues.push(`No visible focus indicator on ${focusInfo.selector} (WCAG 2.4.7)`);
      findings.push(
        createKeyboardFinding(config, ctx, {
          rule: 'focus-visible',
          summary: 'Missing visible focus indicator',
          description: `Element ${focusInfo.selector} received focus without a visible focus style.`,
          selector: focusInfo.selector,
          impact: 'serious',
          criteria: ['2.4.7'],
        }),
      );
    }
  }

  return { focusOrder, issues, findings };
}

function createKeyboardFinding(
  config: AuditorConfig,
  ctx: { route: string; routeName?: string; variant: PageVariant; scenario?: string },
  detail: {
    rule: string;
    summary: string;
    description: string;
    selector: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    criteria: string[];
  },
): AuditFinding {
  return {
    id: `keyboard-${detail.rule}-${detail.selector}-${ctx.variant}`,
    wcag: {
      version: config.wcag.version,
      criteria: detail.criteria,
      level: config.wcag.level,
    },
    impact: detail.impact,
    rule: detail.rule,
    summary: detail.summary,
    description: detail.description,
    helpUrl: 'https://www.w3.org/WAI/WCAG22/quickref/',
    selector: detail.selector,
    remediation: detail.summary,
    needsManualReview: false,
    route: ctx.route,
    routeName: ctx.routeName,
    variant: ctx.variant,
    scenario: ctx.scenario,
    source: 'keyboard',
  };
}
