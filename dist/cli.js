#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const audit_1 = require("./audit");
const config_1 = require("./config");
const report_1 = require("./report");
const PACKAGE_ROOT = (0, path_1.resolve)(__dirname, '..');
function printHelp() {
    console.log(`
a11y-auditor — WCAG accessibility auditor for teams

Usage:
  a11y-auditor audit [--config <path>] [--cwd <dir>]
  a11y-auditor review [--report <path>] [--cwd <dir>]
  a11y-auditor init [--cwd <dir>]
  a11y-auditor --help

Commands:
  audit   Run WCAG scan using a11y-auditor.config.ts (or .json)
  review  Generate agent-review.md from an existing report.json
  init    Scaffold config, npm script hint, GitHub Action, and Cursor skill

Options:
  --config  Path to config file (default: auto-discover in cwd)
  --cwd     Working directory (default: process.cwd())
`);
}
async function runAudit(args) {
    const cwd = getArg(args, '--cwd') ?? process.cwd();
    const configPath = getArg(args, '--config');
    console.log(`Loading config from ${cwd}...`);
    const config = await (0, config_1.loadConfig)(cwd, configPath);
    console.log(`Auditing ${config.baseUrl} (WCAG ${config.wcag.version} ${config.wcag.level})...`);
    const report = await (0, audit_1.audit)(config);
    const written = await (0, report_1.writeReports)(report, config, cwd);
    for (const file of written) {
        console.log(`Report written: ${file}`);
    }
    console.log(`
Summary:
  Violations:     ${report.summary.violations}
  Waived:         ${report.summary.waived ?? 0}
  Manual review:  ${report.summary.incomplete}
  Critical:       ${report.summary.byImpact.critical}
  Serious:        ${report.summary.byImpact.serious}
  Status:         ${report.summary.passed ? 'PASSED' : 'FAILED'}

Open a11y-reports/agent-review.md in Cursor for AI-guided fixes.
`);
    return report.summary.passed ? 0 : 1;
}
async function runReview(args) {
    const cwd = getArg(args, '--cwd') ?? process.cwd();
    const reportPath = getArg(args, '--report') ?? (0, path_1.join)(cwd, 'a11y-reports', 'report.json');
    if (!(0, fs_1.existsSync)(reportPath)) {
        console.error(`Report not found: ${reportPath}`);
        console.error('Run "a11y-auditor audit" first, or pass --report <path>');
        return 2;
    }
    const report = JSON.parse((0, fs_1.readFileSync)(reportPath, 'utf-8'));
    const outputPath = (0, path_1.join)((0, path_1.dirname)(reportPath), 'agent-review.md');
    (0, report_1.writeAgentReviewBrief)(report, outputPath);
    console.log(`Agent review brief written: ${outputPath}`);
    console.log('\nOpen in Cursor and ask: "Review agent-review.md and suggest fixes"');
    return 0;
}
async function runInit(args) {
    const cwd = getArg(args, '--cwd') ?? process.cwd();
    const templatesDir = (0, path_1.join)(PACKAGE_ROOT, 'templates');
    const configDest = (0, path_1.join)(cwd, 'a11y-auditor.config.ts');
    if (!(0, fs_1.existsSync)(configDest)) {
        (0, fs_1.copyFileSync)((0, path_1.join)(templatesDir, 'a11y-auditor.config.example.ts'), configDest);
        console.log(`Created ${configDest}`);
    }
    else {
        console.log(`Skipped ${configDest} (already exists)`);
    }
    const waiversDest = (0, path_1.join)(cwd, 'a11y-waivers.json');
    if (!(0, fs_1.existsSync)(waiversDest)) {
        (0, fs_1.copyFileSync)((0, path_1.join)(templatesDir, 'a11y-waivers.example.json'), waiversDest);
        console.log(`Created ${waiversDest}`);
    }
    else {
        console.log(`Skipped ${waiversDest} (already exists)`);
    }
    const ghDir = (0, path_1.join)(cwd, '.github', 'workflows');
    (0, fs_1.mkdirSync)(ghDir, { recursive: true });
    const workflowDest = (0, path_1.join)(ghDir, 'a11y-audit.yml');
    if (!(0, fs_1.existsSync)(workflowDest)) {
        (0, fs_1.copyFileSync)((0, path_1.join)(templatesDir, 'github-action.yml'), workflowDest);
        console.log(`Created ${workflowDest}`);
    }
    else {
        console.log(`Skipped ${workflowDest} (already exists)`);
    }
    const skillDestDir = (0, path_1.join)(cwd, '.cursor', 'skills', 'wcag-auditor');
    (0, fs_1.mkdirSync)(skillDestDir, { recursive: true });
    const skillDest = (0, path_1.join)(skillDestDir, 'SKILL.md');
    const skillTemplateDir = (0, path_1.join)(templatesDir, 'cursor-skill', 'wcag-auditor');
    for (const file of ['SKILL.md', 'reference.md']) {
        const dest = (0, path_1.join)(skillDestDir, file);
        if (!(0, fs_1.existsSync)(dest)) {
            (0, fs_1.copyFileSync)((0, path_1.join)(skillTemplateDir, file), dest);
            console.log(`Created ${dest}`);
        }
        else {
            console.log(`Skipped ${dest} (already exists)`);
        }
    }
    const packageJsonPath = (0, path_1.join)(cwd, 'package.json');
    if ((0, fs_1.existsSync)(packageJsonPath)) {
        try {
            const pkg = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf-8'));
            if (!pkg.scripts?.['a11y:audit']) {
                console.log(`
Add this script to package.json:

  "scripts": {
    "a11y:audit": "a11y-auditor audit"
  }
`);
            }
        }
        catch {
            // ignore parse errors
        }
    }
    console.log(`
Init complete. Next steps:
  1. Edit a11y-auditor.config.ts (baseUrl, routes)
  2. Start your app, then run: npx a11y-auditor audit
  3. Open a11y-reports/report.html for results
`);
    return 0;
}
function getArg(args, flag) {
    const index = args.indexOf(flag);
    if (index === -1 || index + 1 >= args.length) {
        return undefined;
    }
    return args[index + 1];
}
async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        printHelp();
        process.exit(0);
    }
    const command = args[0];
    try {
        let exitCode = 0;
        if (command === 'audit') {
            exitCode = await runAudit(args.slice(1));
        }
        else if (command === 'review') {
            exitCode = await runReview(args.slice(1));
        }
        else if (command === 'init') {
            exitCode = await runInit(args.slice(1));
        }
        else {
            console.error(`Unknown command: ${command}`);
            printHelp();
            exitCode = 2;
        }
        process.exit(exitCode);
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(2);
    }
}
main();
//# sourceMappingURL=cli.js.map