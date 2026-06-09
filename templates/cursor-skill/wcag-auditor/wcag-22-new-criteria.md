# WCAG 2.2-Only Success Criteria

These criteria are **new in WCAG 2.2** and were not required under WCAG 2.1. Teams upgrading from 2.1 often miss them.

Check status in `agent-review.md` → **WCAG 2.2-only criteria** section, or `wcag-context.json` → `wcag22NewCriteria`.

## Criteria at AA level (default auditor target)

| ID | Title | What to verify |
|----|-------|----------------|
| **2.4.11** | Focus Not Obscured (Minimum) | Focused element not fully hidden by sticky headers, footers, or overlays |
| **2.5.7** | Dragging Movements | Drag operations have a single-pointer alternative (buttons, menus) |
| **2.5.8** | Target Size (Minimum) | Interactive targets at least 24×24 CSS pixels (with exceptions) |
| **3.2.6** | Consistent Help | Help mechanisms appear in the same relative order across pages |
| **3.3.8** | Accessible Authentication (Minimum) | No cognitive function test (e.g. remember password) without alternative |

## Criteria at A level (included when targeting AA)

| ID | Title | What to verify |
|----|-------|----------------|
| **2.1.4** | Character Key Shortcuts | Single-key shortcuts can be turned off or remapped |
| **3.3.7** | Redundant Entry | Previously entered info is auto-filled or selectable |

## Auditor automation coverage

| ID | Automated by auditor? |
|----|----------------------|
| 2.4.11 | Yes — behavioral check (focus obscured) |
| 2.5.8 | Yes — behavioral check (target size) |
| 2.1.4 | Manual review |
| 2.5.7 | Manual review |
| 3.2.6 | Manual review |
| 3.3.7 | Manual review |
| 3.3.8 | Manual review |

## Agent workflow for 2.2-only items

1. Read status in `wcag-context.json` → `wcag22NewCriteria`
2. For `needs-manual-review`: propose verification steps, not blind code changes
3. For `failed`: use `guidance.howToFix` + W3C Understanding link
4. Confirm the consumer project declares WCAG 2.2 (not 2.1) in their VPAT or policy

## W3C links

- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WCAG 2.2 Quick Ref](https://www.w3.org/WAI/WCAG22/quickref/)
