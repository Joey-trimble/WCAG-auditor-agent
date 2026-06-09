# Agent review (Phase 3)

Phase 3 adds an **AI-ready remediation brief** with W3C-aligned guidance per success criterion.

## Auto-generated on every audit

After `npx a11y-auditor audit`, you get:

```
a11y-reports/
  report.json
  report.html
  agent-review.md   ← new
```

## Regenerate without re-scanning

```bash
npx a11y-auditor review
# or
npx a11y-auditor review --report ./a11y-reports/report.json
```

## Use with Cursor

1. Open `a11y-reports/agent-review.md`
2. Ask: **"Review agent-review.md and suggest fixes in this codebase"**
3. The `wcag-auditor` skill (from `npx a11y-auditor init`) guides the agent

## What's in agent-review.md

- Executive summary and top violations
- **Priority fixes** grouped by failed WCAG criterion
- **Manual review queue** with how-to-test and how-to-fix guidance
- W3C Understanding links per criterion
- W3C Techniques references (H37, G18, ARIA6, etc.)
- Keyboard and behavioral check results

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
