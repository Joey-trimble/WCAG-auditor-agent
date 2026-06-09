# WCAG Agent Reference (Phase 6)

Use this with `a11y-reports/agent-review.md` and `a11y-reports/wcag-context.json`.

## Workflow

1. Run audit: `npx a11y-auditor audit`
2. Open `a11y-reports/agent-review.md` (auto-generated)
3. Open `a11y-reports/wcag-context.json` for structured hierarchy
4. Or regenerate: `npx a11y-auditor review`
5. Ask Cursor: **"Review agent-review.md and wcag-context.json; fix accessibility issues in this codebase"**

## Report fields to use

| Field | Purpose |
|-------|---------|
| `wcag-context.json` → `principles` | Full principle → guideline → criterion tree with status |
| `wcag-context.json` → `wcag22NewCriteria` | WCAG 2.2-only criteria and their status |
| `wcag-context.json` → `topFindings` | Priority findings with hierarchy + techniques |
| `findings[].guidance` | Summary, how to test, how to fix, W3C techniques |
| `findings[].w3c.understanding` | Official W3C Understanding doc per criterion |
| `wcagChecklist[].status` | failed / incomplete / automated-pass / needs-manual-review |

## Traceability chain

Always trace: **Principle → Guideline → Success Criterion → Technique → Fix**

See `wcag-hierarchy.md` for the four principles and `wcag-22-new-criteria.md` for 2.2-only items.

## Fix priority

1. `critical` and `serious` violations with selectors
2. `failed` checklist criteria (by principle: Operable and Perceivable first)
3. WCAG 2.2-only criteria with `failed` status
4. `incomplete` axe items
5. `needs-manual-review` checklist items — propose verification steps, not blind fixes

## Per-finding output format

```markdown
### WCAG X.X.X Title
- **Hierarchy:** Principle → Guideline → SC
- **File/element:** path or selector
- **Problem:** what fails
- **Fix:** concrete code change
- **Techniques:** H37, G18
- **Verify:** keyboard + screen reader step
- **W3C:** [Understanding](url)
```

## W3C official sources

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Techniques](https://www.w3.org/WAI/WCAG22/Techniques/)
- [What's New in 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

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
