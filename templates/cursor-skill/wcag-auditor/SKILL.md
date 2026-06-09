---
name: wcag-auditor
description: Run WCAG 2.2 accessibility audits using a11y-auditor-agent, interpret findings with full W3C hierarchy (principle → guideline → criterion → technique), and suggest fixes. Use when auditing pages, reviewing a11y reports, agent-review.md, wcag-context.json, or fixing accessibility violations.
---

# WCAG Auditor

## Official W3C references

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) — what WCAG is
- [How to Meet WCAG 2 — Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — criteria, techniques, failures
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) — detailed guidance per criterion
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — 2.2-only criteria

## Phase 6 — Full W3C guided review (preferred)

1. **Run audit** (if no recent report):
   ```bash
   npx a11y-auditor audit
   ```

2. **Open both agent inputs:**
   ```
   a11y-reports/agent-review.md    ← human-readable brief
   a11y-reports/wcag-context.json  ← machine-readable hierarchy
   ```
   Regenerate without re-scanning: `npx a11y-auditor review`

3. **Read skill references** in this folder:
   - `wcag-hierarchy.md` — principle → guideline → criterion traceability
   - `wcag-22-new-criteria.md` — WCAG 2.2-only criteria checklist
   - `reference.md` — fix format and technique prefixes

4. **For each issue**, trace the full chain:
   **Principle → Guideline → Success Criterion → Technique → Fix**

5. **Check WCAG 2.2-only criteria** — see `wcag-22-new-criteria.md` and the brief's dedicated section.

6. **Propose concrete code fixes** in the consumer's codebase with file paths and selectors.

## Fallback: raw JSON report

If `agent-review.md` is missing, read `./a11y-reports/report.json` and apply the same workflow using `findings[].guidance`, `wcagChecklist[].guidance`, and `wcag-context.json` if present.

## Triage order

1. `critical` and `serious` violations (check hierarchy in brief)
2. Failed criteria from `wcagChecklist` / `wcag-context.json`
3. WCAG 2.2-only criteria with `failed` or `needs-manual-review`
4. `incomplete` axe items
5. Behavioral findings with `needsManualReview`
6. `needs-manual-review` checklist items — verification steps, not blind fixes

## Per-fix output format

```markdown
### WCAG X.X.X Title
- **Hierarchy:** Perceivable → 1.4 Distinguishable → 1.4.3 Contrast (Minimum)
- **Element:** `selector` on `route`
- **Problem:** ...
- **Fix:** [specific code change]
- **Techniques:** H37, G18
- **Verify:** keyboard + screen reader step
- **W3C:** [Understanding](url)
```

## Limitations

- `guidance` is curated engineering aid — confirm against W3C for compliance decisions
- Shadow DOM / web components may need source-level review
- Not a legal compliance certification
