# Changelog

All notable changes to `a11y-auditor-agent` are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioning follows [SemVer](https://semver.org/).

## [1.4.0] - 2026-06-09

### Added

- **SARIF export** — `report.sarif` for GitHub Code Scanning (`output.formats: ['sarif']`)
- **Rule waivers** — `a11y-waivers.json` with reason, owner, and expiry
- Waived findings excluded from CI failure thresholds
- GitHub Action template uploads SARIF with `security-events: write`
- [docs/enterprise.md](./docs/enterprise.md) — SARIF, waivers, publishing guide
- `init` scaffolds `a11y-waivers.json` example

### Changed

- Report summary includes `waived` count
- HTML report shows waived badge on findings

## [1.3.0] - 2026-06-09

### Added

- **Phase 3 — Agent review brief** (`agent-review.md`) auto-generated on every audit
- W3C playbook per criterion (`guidance`: summary, howToTest, howToFix, techniques)
- `a11y-auditor review` CLI command
- Cursor skill `reference.md` for agent remediation workflow

## [1.2.0] - 2026-06-09

### Added

- **Phase 2 — Behavioral checks** (page title, lang, landmarks, skip links, reflow, target size, focus obscured, form labels, consistent nav)
- Scenario step `press <key>` for dialog testing
- [docs/behavioral-checks.md](./docs/behavioral-checks.md)

## [1.1.0] - 2026-06-09

### Added

- **Phase 1 — W3C enrichment**
- Full WCAG 2.2 AA checklist in every report
- W3C Understanding + Quick Ref links on findings
- `wcagChecklist`, `checklistSummary`, `w3cReferences` in JSON reports

## [1.0.0] - 2026-06-09

### Added

- Initial release
- axe-core + Playwright scanner
- Keyboard/focus checks
- JSON + HTML reports
- `a11y-auditor audit` and `init` CLI
- Cursor `wcag-auditor` skill template
- GitHub Action template

[1.4.0]: https://github.com/Joey-trimble/WCAG-auditor-agent/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/Joey-trimble/WCAG-auditor-agent/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Joey-trimble/WCAG-auditor-agent/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Joey-trimble/WCAG-auditor-agent/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Joey-trimble/WCAG-auditor-agent/releases/tag/v1.0.0
