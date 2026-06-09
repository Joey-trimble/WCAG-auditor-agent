# WCAG-auditor-agent

Reusable **WCAG 2.2** accessibility auditor for teams. Combines **axe-core** automated rules, **keyboard/focus** checks, and a **Cursor agent skill** for interpretation and fixes.

## Install in your project

```bash
npm install -D github:Joey-trimble/WCAG-auditor-agent
npx playwright install chromium
npx a11y-auditor init
```

See [docs/sharing.md](./docs/sharing.md) for GitHub setup, releases, and npm publish.

## Quick start

```bash
# 1. Configure (created by init)
#    Edit a11y-auditor.config.ts — set baseUrl and routes

# 2. Start your app
npm run dev

# 3. Run audit (separate terminal)
npx a11y-auditor audit

# 4. Open report
open a11y-reports/report.html
```

Add to `package.json`:

```json
"scripts": {
  "a11y:audit": "a11y-auditor audit"
}
```

## Commands

| Command | Description |
|---------|-------------|
| `a11y-auditor audit` | Run scan using `a11y-auditor.config.ts` |
| `a11y-auditor review` | Generate `agent-review.md` from existing report |
| `a11y-auditor init` | Scaffold config, CI workflow, Cursor skill |

## Features

- WCAG 2.1 / 2.2 levels A, AA, AAA (default: **2.2 AA**)
- **Full WCAG checklist** in every report — all success criteria with status
- **W3C official links** on every finding ([Overview](https://www.w3.org/WAI/standards-guidelines/wcag/), Understanding, Quick Ref)
- **Behavioral checks (Phase 2)** — page title, lang, landmarks, skip links, reflow, target size, consistent nav
- **Agent review brief (Phase 3)** — `agent-review.md` with W3C playbook per criterion for Cursor/AI fixes
- Multi-route scanning with auth profiles (`storageState`)
- Page variants: default, dark mode, 200% zoom
- Scenario steps (open menus, dialogs) before scan
- JSON + HTML reports
- CI-friendly exit codes
- Cursor skill for agent-driven review

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/adoption.md](./docs/adoption.md) | Team onboarding |
| [docs/behavioral-checks.md](./docs/behavioral-checks.md) | Phase 2 behavioral test reference |
| [docs/agent-review.md](./docs/agent-review.md) | Phase 3 AI remediation brief |
| [docs/sharing.md](./docs/sharing.md) | GitHub repo, releases, install options |
| [templates/a11y-auditor.config.example.ts](./templates/a11y-auditor.config.example.ts) | Full config reference |

## Development

```bash
npm install
npm run build
npx playwright install chromium
```

## Disclaimer

Automated auditing detects a subset of WCAG issues. Use alongside manual testing (screen readers, cognitive review). Not a legal compliance certification.
