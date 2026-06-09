---
name: wcag-auditor
description: Run WCAG 2.2 accessibility audits using a11y-auditor-agent, interpret findings, and suggest fixes mapped to W3C success criteria. Use when auditing pages, reviewing a11y reports, or fixing accessibility violations.
---

# WCAG Auditor

## Official W3C references

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) — what WCAG is
- [How to Meet WCAG 2 — Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) — criteria, techniques, failures
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) — detailed guidance per criterion

## When to use

- User asks for an accessibility audit or WCAG review
- User references `a11y-reports/report.json` or `report.html`
- PR review includes accessibility concerns

## Workflow

1. **Run the audit** (if no recent report exists):
   ```bash
   npx a11y-auditor audit
   ```
   Ensure the app is running at `baseUrl` from `a11y-auditor.config.ts`.

2. **Read the report** from `./a11y-reports/report.json`.

3. **Review coverage first** — check `wcagChecklist` and `checklistSummary`:
   - `failed` — automated violations; fix immediately
   - `incomplete` — axe could not decide; investigate manually
   - `automated-pass` — axe passed rules for this criterion (not full conformance)
   - `needs-manual-review` — no automated test; human must verify using W3C Understanding docs

4. **Review behavioral checks** — see `behavioralAudit.passedChecks` and behavioral findings (`source: "behavioral"`):
   - Page title (2.4.2), lang (3.1.1), landmarks, skip links, reflow, target size, consistent nav
   - See [docs/behavioral-checks.md](https://github.com/Joey-trimble/WCAG-auditor-agent/blob/main/docs/behavioral-checks.md)

5. **Triage findings** in this order:
   - `critical` and `serious` violations
   - `incomplete` axe items
   - Behavioral findings flagged `needsManualReview`
   - `wcagChecklist` items with `needs-manual-review`
   - Keyboard audit issues from `keyboardAudit.issues`

6. **For each finding**, provide:
   - WCAG success criteria and `criterionTitle`
   - W3C links: `finding.w3c.understanding` and `finding.w3c.quickRef`
   - Impact and rule ID
   - Element selector and route/variant
   - Concrete code fix in the consumer's codebase
   - Axe rule link (`finding.helpUrl`) for technical detail

7. **Manual review items** (`needsManualReview: true` or checklist `needs-manual-review`):
   - Link to the W3C Understanding document for that criterion
   - State what a human must verify (e.g. alt text meaning, error recovery)
   - Do not mark as "fixed" without evidence

## Report output template

```markdown
## Accessibility audit summary

**Status:** PASSED / FAILED
**WCAG:** 2.2 AA
**Violations:** N (critical: X, serious: Y)
**Criteria coverage:** X failed, Y incomplete, Z need manual review (of 50 total)

### Top issues
1. [Impact] Summary — WCAG X.X.X Title — `selector` — [Understanding](url) — suggested fix

### Manual review queue (from checklist)
- 1.2.2 Captions — no automated test — verify prerecorded video has captions

### Keyboard
- Focus order notes
```

## Limitations

- Automated scans catch a subset of WCAG issues; `wcagChecklist` shows the full gap.
- Shadow DOM / web components may need source-level review beyond axe selectors.
- `automated-pass` means axe passed related rules, not guaranteed full SC conformance.
- This is an engineering aid, not a legal compliance certification.
