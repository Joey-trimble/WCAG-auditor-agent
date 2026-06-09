# WCAG Agent Reference (Phase 3)

Use this with `a11y-reports/agent-review.md` — the primary input for AI remediation.

## Workflow

1. Run audit: `npx a11y-auditor audit`
2. Open `a11y-reports/agent-review.md` (auto-generated)
3. Or regenerate: `npx a11y-auditor review`
4. Ask Cursor: **"Review agent-review.md and fix accessibility issues in this codebase"**

## Report fields to use

| Field | Purpose |
|-------|---------|
| `findings[].guidance` | Summary, how to test, how to fix, W3C techniques |
| `findings[].w3c.understanding` | Official W3C Understanding doc per criterion |
| `wcagChecklist[].status` | failed / incomplete / automated-pass / needs-manual-review |
| `wcagChecklist[].guidance` | Playbook for criteria without automated findings |

## Fix priority

1. `critical` and `serious` violations with selectors
2. `failed` checklist criteria
3. `incomplete` axe items
4. `needs-manual-review` checklist items — propose verification steps, not blind fixes

## Per-finding output format

For each issue in agent-review.md:

```markdown
### WCAG X.X.X Title
- **File/element:** path or selector
- **Problem:** what fails
- **Fix:** concrete code change
- **Verify:** keyboard + screen reader step
- **W3C:** [Understanding](url)
```

## W3C official sources

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Techniques](https://www.w3.org/WAI/WCAG22/Techniques/)

## Common technique prefixes

| Prefix | Type |
|--------|------|
| H | HTML techniques |
| C | CSS techniques |
| G | General techniques |
| ARIA | ARIA techniques |
| SCR | Script techniques |

## Limitations

- `guidance` is curated engineering aid — confirm against W3C Understanding for compliance decisions
- Shadow DOM / web components may need source-level fixes beyond selectors
- Not a substitute for manual assistive technology testing
