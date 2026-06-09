# Team adoption guide

Add WCAG 2.2 AA auditing to any web app in a few minutes.

## 1. Install

**From GitHub** (replace `YOUR_ORG`):

```bash
npm install -D github:YOUR_ORG/a11y-auditor-agent
npx playwright install chromium
```

**From npm** (if published):

```bash
npm install -D a11y-auditor-agent
npx playwright install chromium
```

## 2. Initialize

```bash
npx a11y-auditor init
```

This creates:

- `a11y-auditor.config.ts` — routes, WCAG level, thresholds
- `.github/workflows/a11y-audit.yml` — CI workflow (adjust build/preview commands)
- `.cursor/skills/wcag-auditor/SKILL.md` — Cursor agent skill

## 3. Configure

Edit `a11y-auditor.config.ts`:

```typescript
baseUrl: process.env.APP_URL ?? 'http://localhost:5173',
routes: [
  { path: '/', name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', auth: 'logged-in' },
],
```

For authenticated routes, add Playwright `storageState` under `auth.profiles`.

## 4. Run locally

```bash
# Terminal 1 — start your app
npm run dev

# Terminal 2 — run audit
npm run a11y:audit
# or: npx a11y-auditor audit
```

Open `a11y-reports/report.html` for the human-readable report.

## 5. CI

The generated GitHub Action runs on pull requests. Customize:

- `npm run build` / `npm run preview` for your stack
- `APP_URL` environment variable
- Add `wait-on` if not already a dependency: `npm install -D wait-on`

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Passed thresholds |
| 1 | Violations exceed thresholds |
| 2 | Config or runtime error |

## Programmatic API

```typescript
import { audit, loadConfig, writeReports } from 'a11y-auditor-agent';

const config = await loadConfig(process.cwd());
const report = await audit(config);
await writeReports(report, config, process.cwd());
```

## Publishing internally

To share across teams via npm:

1. Set `"name": "@your-org/a11y-auditor"` in `package.json`
2. Publish to your registry
3. Teams install with `npm install -D @your-org/a11y-auditor`
