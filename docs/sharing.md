# Sharing with other teams

## Create the GitHub repository

### Option A — GitHub website

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `WCAG-auditor-agent`
3. Visibility: **Internal** or **Private** (recommended for org tools) or **Public**
4. Do **not** add a README, .gitignore, or license (this repo already has them)
5. Click **Create repository**
6. In your terminal, from this folder:

```bash
git remote add origin https://github.com/Joey-trimble/WCAG-auditor-agent.git
git branch -M main
git push -u origin main
```

7. Update `package.json` → `repository.url` with your real GitHub URL.

### Option B — GitHub CLI

```bash
brew install gh
gh auth login
gh repo create WCAG-auditor-agent --private --source=. --remote=origin --push
```

---

## How teams install it

### From GitHub (no npm publish required)

```bash
npm install -D github:Joey-trimble/WCAG-auditor-agent
npx playwright install chromium
npx a11y-auditor init
```

Or with HTTPS:

```bash
npm install -D "git+https://github.com/Joey-trimble/WCAG-auditor-agent.git"
```

Pin a version tag for stability:

```bash
npm install -D "github:Joey-trimble/WCAG-auditor-agent#v1.0.0"
```

### From npm (after publishing)

```bash
npm publish --access public   # or publish to GitHub Packages / Artifactory
```

Teams then run:

```bash
npm install -D a11y-auditor-agent
```

### From a monorepo path (local dev)

```bash
npm install -D "file:../path/to/a11y-auditor-agent"
```

---

## Release workflow

1. Bump version in `package.json`
2. Commit and tag:

```bash
git tag v1.0.0
git push origin main --tags
```

3. Teams pin installs to `#v1.0.0` or you publish to npm

---

## What teams do after install

See [adoption.md](./adoption.md):

```bash
npx a11y-auditor init
# edit a11y-auditor.config.ts
npm run dev          # their app
npx a11y-auditor audit
```
