---
name: wcag-auditor
description: Run WCAG 2.2 accessibility audits using a11y-auditor-agent, interpret findings, and suggest fixes mapped to W3C success criteria. Use when auditing pages, reviewing a11y reports, agent-review.md, or fixing accessibility violations.
---

# WCAG Auditor

## Official W3C references

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) — what WCAG is
- [How to Meet WCAG 2 — Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — criteria, techniques, failures
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) — detailed guidance per criterion

## Phase 3 — Agent review workflow (preferred)

1. **Run audit** (if no recent report):
   ```bash
   npx a11y-auditor audit
   ```

2. **Open the agent brief** — primary input for remediation:
   ```
   a11y-reports/agent-review.md
   ```
   Regenerate without re-scanning: `npx a11y-auditor review`

3. **Read reference.md** in this skill folder for fix format and technique prefixes.

4. **For each criterion in the brief**, use:
   - `guidance.summary`, `guidance.howToTest`, `guidance.howToFix`
   - `guidance.techniques` (W3C technique IDs)
   - `w3c.understanding` link for authoritative detail

5. **Propose concrete code fixes** in the consumer's codebase with file paths and selectors from the brief.

## Fallback: raw JSON report

If `agent-review.md` is missing, read `./a11y-reports/report.json` and apply the same workflow using `findings[].guidance` and `wcagChecklist[].guidance`.

## Triage order

1. `critical` and `serious` violations
2. Failed criteria from `wcagChecklist`
3. `incomplete` axe items
4. Behavioral findings with `needsManualReview`
5. `needs-manual-review` checklist items — verification steps, not blind fixes

## Per-fix output format

```markdown
### WCAG X.X.X Title
- **Element:** `selector` on `route`
- **Problem:** ...
- **Fix:** [specific code change]
- **Verify:** keyboard + screen reader step
- **W3C:** [Understanding](url) · Techniques: H37, G18
```

## Limitations

- `guidance` is curated engineering aid — confirm against W3C for compliance decisions
- Shadow DOM / web components may need source-level review
- Not a legal compliance certification
