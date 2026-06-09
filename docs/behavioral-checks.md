# Behavioral checks (Phase 2)

ACT-aligned Playwright tests that cover WCAG gaps axe often misses.

## Checks per page

| Rule ID | WCAG | What it tests |
|---------|------|----------------|
| `behavioral-page-title` | 2.4.2 | Document has a non-empty `<title>` |
| `behavioral-html-lang` | 3.1.1 | `<html lang="...">` is present |
| `behavioral-main-landmark` | 1.3.1, 2.4.1 | `<main>` or `role="main"` exists |
| `behavioral-page-h1` | 1.3.1, 2.4.6 | Single `<h1>` on page |
| `behavioral-skip-link` | 2.4.1 | Skip link or hash-to-main on content-heavy pages |
| `behavioral-viewport-zoom` | 1.4.4 | Viewport meta does not block zoom |
| `behavioral-unlabeled-input` | 3.3.2, 4.1.2 | Form controls have labels or ARIA names |
| `behavioral-target-size` | 2.5.8 | Interactive targets ≥ 24×24px (WCAG 2.2) |
| `behavioral-focus-obscured` | 2.4.11 | Focus not hidden by fixed/sticky overlays (WCAG 2.2) |
| `behavioral-reflow` | 1.4.10 | No horizontal scroll at 320px viewport width |

## Cross-page checks

| Rule ID | WCAG | What it tests |
|---------|------|----------------|
| `behavioral-consistent-nav` | 3.2.3 | Navigation links are consistent across routes |

Requires **2+ routes** in config.

## Scenario steps

Open menus or dialogs before scanning:

```typescript
scenarios: [
  {
    name: 'Mobile menu open',
    route: '/',
    steps: ['click [data-testid=menu-toggle]', 'wait 300ms'],
  },
  {
    name: 'Dialog open',
    route: '/settings',
    steps: ['click #open-dialog', 'wait 300ms', 'press Escape'],
  },
],
```

Supported steps: `click <selector>`, `type <text> into <selector>`, `press <key>`, `wait <n>ms`.

## Disable behavioral checks

```typescript
behavioral: { enabled: false },
```
