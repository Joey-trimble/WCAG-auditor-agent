# Enterprise features (Phase 4)

## SARIF export (GitHub Code Scanning)

Enable SARIF in config:

```typescript
output: {
  dir: './a11y-reports',
  formats: ['json', 'html', 'sarif'],
},
```

Produces `a11y-reports/report.sarif` compatible with [GitHub Code Scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning).

The generated GitHub Action uploads SARIF automatically (requires `security-events: write`).

## Rule waivers

Document known exceptions in `a11y-waivers.json`:

```json
{
  "waivers": [
    {
      "id": "WAIVER-001",
      "rule": "color-contrast",
      "criteria": ["1.4.3"],
      "route": "/legacy",
      "selector": ".banner",
      "reason": "Scheduled redesign; design sign-off attached in JIRA-123",
      "owner": "team@example.com",
      "expires": "2026-12-31"
    }
  ]
}
```

### Matching rules

A waiver applies when **all specified fields** match:

| Field | Match |
|-------|-------|
| `rule` | Exact rule ID |
| `criteria` | Any overlap with finding criteria |
| `route` | Exact route path |
| `selector` | Finding selector contains this string |

Omit fields to match broadly (use carefully).

### Expiry

Expired waivers are ignored. The report lists `waivers.expired` so CI can warn when renewals are needed.

### CI impact

Waived violations:
- Do **not** fail the audit threshold
- Appear in reports with a **Waived** badge
- Are marked as suppressed in SARIF

## Publishing

### GitHub install (current)

```bash
npm install -D github:Joey-trimble/WCAG-auditor-agent#v1.4.0
```

### npm publish (optional)

```bash
npm login
npm publish --access public
```

### GitHub Packages

```bash
npm publish --registry=https://npm.pkg.github.com
```

Add to consumer `.npmrc`:

```
@joey-trimble:registry=https://npm.pkg.github.com
```

## Versioning

This project follows [Semantic Versioning](https://semver.org/). See [CHANGELOG.md](../CHANGELOG.md).

Pin installs in production:

```bash
npm install -D "github:Joey-trimble/WCAG-auditor-agent#v1.4.0"
```

## Compliance note

Waivers and SARIF integration support engineering workflow — they do not constitute legal WCAG certification.
