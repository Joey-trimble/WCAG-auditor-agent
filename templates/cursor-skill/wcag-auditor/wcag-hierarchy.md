# WCAG Hierarchy Reference (Phase 6)

Use this with `agent-review.md` and `wcag-context.json` for full-standard guided review.

## Traceability chain

For every finding, trace:

```
Principle → Guideline → Success Criterion → W3C Technique → Code fix
```

Example:

```
Operable → 2.4 Navigable → 2.4.11 Focus Not Obscured → G207 → adjust sticky header z-index / scroll padding
```

## Four principles

| Principle | Focus |
|-----------|-------|
| **Perceivable** | Users can perceive content (text alternatives, contrast, structure) |
| **Operable** | Users can operate UI (keyboard, navigation, input modalities) |
| **Understandable** | Users can understand content and UI behavior |
| **Robust** | Content works with assistive technologies |

## Report inputs

| File | Use |
|------|-----|
| `a11y-reports/agent-review.md` | Human-readable brief with hierarchy per finding |
| `a11y-reports/wcag-context.json` | Machine-readable principle → guideline → criterion tree |
| `a11y-reports/report.json` | Raw findings with `guidance` and `w3c` links |

## `wcag-context.json` structure

```json
{
  "principles": [
    {
      "principle": "Operable",
      "summary": { "failed": 2, "needsManualReview": 5 },
      "guidelines": [
        {
          "id": "2.4",
          "title": "Navigable",
          "criteria": [
            {
              "id": "2.4.11",
              "hierarchy": "Operable → 2.4 Navigable → 2.4.11 Focus Not Obscured",
              "status": "failed",
              "isWcag22Only": true,
              "guidance": { "techniques": ["G207"] }
            }
          ]
        }
      ]
    }
  ],
  "wcag22NewCriteria": [],
  "topFindings": []
}
```

## Per-fix output format (required)

```markdown
### WCAG X.X.X Title
- **Hierarchy:** Principle → Guideline → SC
- **Element:** `selector` on `route`
- **Problem:** ...
- **Fix:** [specific code change]
- **Techniques:** H37, G18, ARIA6
- **Verify:** keyboard + screen reader step
- **W3C:** [Understanding](url)
```

## W3C official sources

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)
- [Techniques](https://www.w3.org/WAI/WCAG22/Techniques/)
