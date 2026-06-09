# Static analysis (Phase 5)

Optional **source-level** checks via ESLint and `eslint-plugin-jsx-a11y`. Catches accessibility issues in code that may not render during runtime scans.

## Setup in your project

```bash
npm install -D eslint eslint-plugin-jsx-a11y
```

Enable in `a11y-auditor.config.ts`:

```ts
static: {
  enabled: true,
  globs: ['src/**/*.{tsx,jsx}'],
  // eslintConfig: './eslint.config.js',  // optional
},
```

## How it works

- Runs `npx eslint` with JSON output on configured globs
- Maps `jsx-a11y/*` rules to WCAG success criteria
- Findings appear with `source: 'static'` and **file paths** (not DOM selectors)
- Merged into the same report as axe, keyboard, and behavioral checks

## Report fields

| Field | Description |
|-------|-------------|
| `findings[].source` | `'static'` for ESLint findings |
| `findings[].filePath` | Relative path to source file |
| `findings[].line` / `column` | Location in file |
| `staticAudit.filesScanned` | Number of files ESLint processed |
| `findingGroups` | Static + runtime violations grouped by rule |

## Agent workflow

Static findings include file paths — ask Cursor to fix the source directly:

```
Review agent-review.md — fix static (jsx-a11y) findings first since they include file paths.
```

## Limitations

- Opt-in (`static.enabled: true`) — does not run by default
- Requires ESLint installed in the **consumer project**, not in a11y-auditor-agent
- Only `jsx-a11y/*` rules are mapped; other ESLint rules are ignored
- Does not replace runtime testing (contrast, focus order, etc.)
