---
name: wcag-auditor
description: Run WCAG 2.2 accessibility audits using a11y-auditor-agent, interpret findings, and suggest fixes mapped to success criteria. Use when auditing pages, reviewing a11y reports, or fixing accessibility violations.
---

# WCAG Auditor

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

3. **Triage findings** in this order:
   - `critical` and `serious` violations (automated failures)
   - `incomplete` items (manual review queue)
   - Keyboard audit issues from `keyboardAudit.issues`

4. **For each finding**, provide:
   - WCAG success criteria (`finding.wcag.criteria`)
   - Impact and rule ID
   - Element selector and route/variant
   - Concrete code fix in the consumer's codebase
   - Link to `finding.helpUrl` for reference

5. **Manual review items** (`needsManualReview: true`):
   - State what a human must verify (e.g. alt text meaning, contrast on gradients)
   - Do not mark as "fixed" without evidence

## WCAG 2.2 AA focus areas

| Area | Common criteria |
|------|-----------------|
| Text alternatives | 1.1.1 |
| Info and relationships | 1.3.1 |
| Contrast | 1.4.3 |
| Keyboard | 2.1.1, 2.1.2 |
| Focus visible | 2.4.7 |
| Labels | 3.3.2 |
| Name, role, value | 4.1.2 |

## Report output template

```markdown
## Accessibility audit summary

**Status:** PASSED / FAILED
**WCAG:** 2.2 AA
**Violations:** N (critical: X, serious: Y)

### Top issues
1. [Impact] Summary — WCAG X.X.X — `selector` — suggested fix

### Manual review queue
- ...

### Keyboard
- Focus order notes
```

## Limitations

- Automated scans catch ~30–50% of WCAG issues; recommend manual screen reader testing for releases.
- Shadow DOM / web components may need source-level review beyond axe selectors.
- This is an engineering aid, not a legal compliance certification.
