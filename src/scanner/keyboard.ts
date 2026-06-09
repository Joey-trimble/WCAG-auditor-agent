import type { Page } from '@playwright/test';
import type { AuditFinding, AuditorConfig, PageVariant } from '../types';
import { createFinding } from './finding-factory';

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
        createFinding(config, { ...ctx, source: 'keyboard' }, {
          rule: 'keyboard-trap',
          summary: 'Possible keyboard trap or focus cycle',
          description: `Tab navigation returned to ${focusInfo.selector} after ${i + 1} stops.`,
          selector: focusInfo.selector,
          impact: 'serious',
          criteria: ['2.1.2'],
          remediation: 'Ensure users can tab into and out of all interactive regions without getting stuck.',
        }),
      );
      break;
    }

    seen.add(key);
    focusOrder.push(`${focusInfo.tag} ${focusInfo.selector}${focusInfo.text ? ` — "${focusInfo.text}"` : ''}`);

    if (focusInfo.visible && !focusInfo.hasFocusIndicator) {
      issues.push(`No visible focus indicator on ${focusInfo.selector} (WCAG 2.4.7)`);
      findings.push(
        createFinding(config, { ...ctx, source: 'keyboard' }, {
          rule: 'focus-visible',
          summary: 'Missing visible focus indicator',
          description: `Element ${focusInfo.selector} received focus without a visible focus style.`,
          selector: focusInfo.selector,
          impact: 'serious',
          criteria: ['2.4.7'],
          remediation: 'Add a visible :focus or :focus-visible style meeting contrast requirements.',
        }),
      );
    }
  }

  return { focusOrder, issues, findings };
}
