# Agent review (Phase 3 + Phase 6)

Phase 3 adds an **AI-ready remediation brief** with W3C-aligned guidance per success criterion.

Phase 6 adds **full W3C hierarchy** (principle → guideline → criterion → technique) and machine-readable context for agents.

## Auto-generated on every audit

After `npx a11y-auditor audit`, you get:

```
a11y-reports/
  report.json
  report.html
  agent-review.md      ← human-readable brief
  wcag-context.json    ← machine-readable hierarchy (Phase 6)
```

## Regenerate without re-scanning

```bash
npx a11y-auditor review
# or
npx a11y-auditor review --report ./a11y-reports/report.json
```

## Use with Cursor

1. Open `a11y-reports/agent-review.md` and `a11y-reports/wcag-context.json`
2. Ask: **"Review agent-review.md and wcag-context.json; fix accessibility issues in this codebase"**
3. The `wcag-auditor` skill (from `npx a11y-auditor init`) guides the agent with:
   - `wcag-hierarchy.md` — principle → guideline → criterion traceability
   - `wcag-22-new-criteria.md` — WCAG 2.2-only criteria checklist

## What's in agent-review.md

- Executive summary and top violations with **full hierarchy** per finding
- Grouped violation patterns to fix once across multiple routes
- Waived findings section (explicitly non-actionable until waiver expiry)
- **Coverage by principle** table (Perceivable, Operable, Understandable, Robust)
- **WCAG 2.2-only criteria** section with pass/fail status
- **Priority fixes** grouped by failed WCAG criterion
- **Manual review queue** with how-to-test and how-to-fix guidance
- W3C Understanding links and Techniques (H37, G18, ARIA6, etc.) per finding
- Keyboard and behavioral check results

## What's in wcag-context.json (Phase 6)

Machine-readable export for AI agents:

- `principles` — nested principle → guideline → criterion tree with status
- `wcag22NewCriteria` — all WCAG 2.2-only criteria and their audit status
- `topFindings` — priority violations with hierarchy and techniques

## What's in report.html (triage order)

1. Baseline delta (new, fixed, regressed)
2. Grouped fix patterns (owner hint, effort, route risk, confidence, acceptance criteria)
3. CI-blocking findings
4. Static findings by file
5. WCAG 2.2-only criteria
6. Manual verification queue
7. Waiver governance (expiring soon/30/60 day buckets)

## Playbook data

Each finding and checklist item includes `guidance`:

```json
{
  "summary": "What the criterion requires",
  "howToTest": "Manual verification steps",
  "howToFix": "Common remediation approach",
  "techniques": ["H37", "G18"]
}
```

Curated from [W3C WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) Understanding and Techniques.

## npm script

```json
"scripts": {
  "a11y:audit": "a11y-auditor audit",
  "a11y:review": "a11y-auditor review"
}
```
