import type { CriterionGuidance } from '../types';

/**
 * Curated WCAG 2.2 guidance aligned with W3C Understanding docs and Techniques.
 * @see https://www.w3.org/WAI/standards-guidelines/wcag/
 */
const PLAYBOOK: Record<string, CriterionGuidance> = {
  '1.1.1': {
    summary: 'All non-text content has a text alternative that serves the same purpose.',
    howToTest: 'Inspect images, icons, charts, and media with a screen reader; verify alt text or ARIA labels convey meaning.',
    howToFix: 'Add meaningful alt on images; mark decorative images with alt=""; use aria-label on icon-only controls.',
    techniques: ['H37', 'H36', 'ARIA6', 'G94'],
  },
  '1.3.1': {
    summary: 'Information, structure, and relationships are programmatically determinable.',
    howToTest: 'Review heading hierarchy, lists, tables, and form associations in DOM and accessibility tree.',
    howToFix: 'Use semantic HTML (main, nav, h1–h6, table, th); associate labels with inputs; use ARIA only when HTML is insufficient.',
    techniques: ['H42', 'H48', 'H51', 'G115'],
  },
  '1.4.3': {
    summary: 'Text and images of text have contrast ratio of at least 4.5:1 (3:1 for large text).',
    howToTest: 'Use a contrast checker on text/background pairs in default and dark themes.',
    howToFix: 'Darken text or lighten backgrounds; avoid text over busy images without overlay.',
    techniques: ['G18', 'G145', 'G174'],
  },
  '1.4.10': {
    summary: 'Content can be presented without horizontal scrolling at 320px width.',
    howToTest: 'Set viewport to 320px wide; verify no two-dimensional scrolling is required.',
    howToFix: 'Use responsive CSS, flex/grid, avoid fixed widths; allow content to reflow.',
    techniques: ['C32', 'C31', 'G206'],
  },
  '1.4.11': {
    summary: 'UI components and graphical objects have 3:1 contrast against adjacent colors.',
    howToTest: 'Check borders, icons, focus rings, and chart elements against backgrounds.',
    howToFix: 'Increase contrast on form borders, icons, and custom control outlines.',
    techniques: ['G207', 'G195'],
  },
  '2.1.1': {
    summary: 'All functionality is operable through a keyboard without requiring specific timings.',
    howToTest: 'Tab through the page and operate all controls with Enter/Space/Arrow keys only.',
    howToFix: 'Use native interactive elements; add keyboard handlers to custom widgets; ensure focusable controls.',
    techniques: ['G202', 'H91', 'SCR35'],
  },
  '2.1.2': {
    summary: 'Keyboard focus can be moved into and out of all components without trapping the user.',
    howToTest: 'Tab into modals, menus, and widgets; verify Escape or Tab exits without trapping.',
    howToFix: 'Implement focus trap with Escape to close; restore focus to trigger on dismiss.',
    techniques: ['G21', 'SCR37'],
  },
  '2.4.1': {
    summary: 'A mechanism is available to bypass blocks of repeated content.',
    howToTest: 'Tab from page load; first focusable should be skip link or main landmark is reachable quickly.',
    howToFix: 'Add visible-on-focus skip link to #main; use landmarks for main content.',
    techniques: ['G1', 'H69', 'ARIA11'],
  },
  '2.4.2': {
    summary: 'Pages have titles that describe topic or purpose.',
    howToTest: 'Check document title in browser tab; confirm it is unique and descriptive per page.',
    howToFix: 'Set <title> per route; include page context and site name.',
    techniques: ['G88', 'H25'],
  },
  '2.4.3': {
    summary: 'Focusable components receive focus in an order that preserves meaning and operability.',
    howToTest: 'Tab through page; verify focus order matches visual/logical reading order.',
    howToFix: 'Reorder DOM to match visual layout; avoid positive tabindex; manage focus in modals.',
    techniques: ['G59', 'C27', 'SCR26'],
  },
  '2.4.7': {
    summary: 'Keyboard focus indicator is visible when any UI component receives keyboard focus.',
    howToTest: 'Tab through controls; verify a visible focus ring or outline appears on each.',
    howToFix: 'Style :focus-visible with sufficient contrast; never use outline: none without replacement.',
    techniques: ['G149', 'G195', 'C15'],
  },
  '2.4.11': {
    summary: 'Focused element is not entirely hidden by author-created content (WCAG 2.2).',
    howToTest: 'Tab through page with sticky headers/footers; ensure focused item is at least partially visible.',
    howToFix: 'Scroll focused elements into view; reduce sticky overlay height; add scroll padding.',
    techniques: ['C43', 'SCR31'],
  },
  '2.5.8': {
    summary: 'Pointer targets are at least 24×24 CSS pixels (with exceptions) (WCAG 2.2).',
    howToTest: 'Measure clickable areas on touch and mouse targets, especially icon buttons.',
    howToFix: 'Increase hit area with padding/min-size; group closely spaced targets.',
    techniques: ['C42', 'SCR54'],
  },
  '3.1.1': {
    summary: 'Default human language of each page is programmatically determined.',
    howToTest: 'Inspect <html lang="..."> matches the primary page language.',
    howToFix: 'Set lang on html element, e.g. <html lang="en">.',
    techniques: ['H57'],
  },
  '3.3.1': {
    summary: 'Input errors are identified and described to the user in text.',
    howToTest: 'Submit forms with invalid data; verify errors are announced and linked to fields.',
    howToFix: 'Show text error messages; use aria-invalid and aria-describedby on invalid fields.',
    techniques: ['G83', 'ARIA21', 'SCR18'],
  },
  '3.3.2': {
    summary: 'Labels or instructions are provided when content requires user input.',
    howToTest: 'Review all form fields have visible labels or aria-label/labelledby.',
    howToFix: 'Add <label for>; use aria-label when visual label is not possible.',
    techniques: ['H44', 'G131', 'ARIA1'],
  },
  '3.3.8': {
    summary: 'Cognitive function tests are not required for authentication unless alternatives exist (WCAG 2.2).',
    howToTest: 'Review login flows for puzzle/captcha/memory tests without accessible alternatives.',
    howToFix: 'Offer email magic link, OAuth, or copy-paste alternative to cognitive tests.',
    techniques: ['G218', 'H100'],
  },
  '4.1.2': {
    summary: 'UI components have accessible name, role, state, and value.',
    howToTest: 'Inspect custom components in accessibility tree; verify name, role, state with screen reader.',
    howToFix: 'Use native elements; add role, aria-label, aria-expanded, aria-checked as needed.',
    techniques: ['H91', 'ARIA14', 'ARIA16', 'G135'],
  },
  '4.1.3': {
    summary: 'Status messages can be programmatically determined without receiving focus.',
    howToTest: 'Trigger success/error toasts; verify screen reader announces via role="status" or aria-live.',
    howToFix: 'Use role="status" aria-live="polite" for updates; role="alert" for urgent messages.',
    techniques: ['ARIA19', 'ARIA22', 'G193'],
  },
};

export function getPlaybookEntry(criterionId: string, title: string): CriterionGuidance {
  const entry = PLAYBOOK[criterionId];
  if (entry) {
    return entry;
  }

  return {
    summary: `${title} — see W3C Understanding document for the complete requirement.`,
    howToTest: `Evaluate ${criterionId} ${title} using the W3C Quick Reference checklist, keyboard testing, and screen reader verification.`,
    howToFix: `Apply relevant W3C Techniques for ${criterionId}; fix markup, styles, or behavior per Understanding guidance.`,
    techniques: [],
  };
}

export function getPlaybookExport(): Record<string, CriterionGuidance> {
  return { ...PLAYBOOK };
}
