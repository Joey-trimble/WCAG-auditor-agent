#!/usr/bin/env node
import { existsSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { audit } from './audit';
import { loadConfig } from './config';
import { writeReports, writeAgentReviewBrief } from './report';
import type { AuditReport } from './types';

const PACKAGE_ROOT = resolve(__dirname, '..');

function printHelp(): void {
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

async function runAudit(args: string[]): Promise<number> {
  const cwd = getArg(args, '--cwd') ?? process.cwd();
  const configPath = getArg(args, '--config');

  console.log(`Loading config from ${cwd}...`);
  const config = await loadConfig(cwd, configPath);

  console.log(`Auditing ${config.baseUrl} (WCAG ${config.wcag.version} ${config.wcag.level})...`);
  const report = await audit(config);

  const written = await writeReports(report, config, cwd);
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

async function runReview(args: string[]): Promise<number> {
  const cwd = getArg(args, '--cwd') ?? process.cwd();
  const reportPath = getArg(args, '--report') ?? join(cwd, 'a11y-reports', 'report.json');

  if (!existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`);
    console.error('Run "a11y-auditor audit" first, or pass --report <path>');
    return 2;
  }

  const report = JSON.parse(readFileSync(reportPath, 'utf-8')) as AuditReport;
  const outputPath = join(dirname(reportPath), 'agent-review.md');
  writeAgentReviewBrief(report, outputPath);

  console.log(`Agent review brief written: ${outputPath}`);
  console.log('\nOpen in Cursor and ask: "Review agent-review.md and suggest fixes"');
  return 0;
}

async function runInit(args: string[]): Promise<number> {
  const cwd = getArg(args, '--cwd') ?? process.cwd();
  const templatesDir = join(PACKAGE_ROOT, 'templates');

  const configDest = join(cwd, 'a11y-auditor.config.ts');
  if (!existsSync(configDest)) {
    copyFileSync(join(templatesDir, 'a11y-auditor.config.example.ts'), configDest);
    console.log(`Created ${configDest}`);
  } else {
    console.log(`Skipped ${configDest} (already exists)`);
  }

  const waiversDest = join(cwd, 'a11y-waivers.json');
  if (!existsSync(waiversDest)) {
    copyFileSync(join(templatesDir, 'a11y-waivers.example.json'), waiversDest);
    console.log(`Created ${waiversDest}`);
  } else {
    console.log(`Skipped ${waiversDest} (already exists)`);
  }

  const ghDir = join(cwd, '.github', 'workflows');
  mkdirSync(ghDir, { recursive: true });
  const workflowDest = join(ghDir, 'a11y-audit.yml');
  if (!existsSync(workflowDest)) {
    copyFileSync(join(templatesDir, 'github-action.yml'), workflowDest);
    console.log(`Created ${workflowDest}`);
  } else {
    console.log(`Skipped ${workflowDest} (already exists)`);
  }

  const skillDestDir = join(cwd, '.cursor', 'skills', 'wcag-auditor');
  mkdirSync(skillDestDir, { recursive: true });
  const skillDest = join(skillDestDir, 'SKILL.md');
  const skillTemplateDir = join(templatesDir, 'cursor-skill', 'wcag-auditor');
  for (const file of ['SKILL.md', 'reference.md']) {
    const dest = join(skillDestDir, file);
    if (!existsSync(dest)) {
      copyFileSync(join(skillTemplateDir, file), dest);
      console.log(`Created ${dest}`);
    } else {
      console.log(`Skipped ${dest} (already exists)`);
    }
  }

  const packageJsonPath = join(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        scripts?: Record<string, string>;
      };
      if (!pkg.scripts?.['a11y:audit']) {
        console.log(`
Add this script to package.json:

  "scripts": {
    "a11y:audit": "a11y-auditor audit"
  }
`);
      }
    } catch {
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

function getArg(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    return undefined;
  }
  return args[index + 1];
}

async function main(): Promise<void> {
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
    } else if (command === 'review') {
      exitCode = await runReview(args.slice(1));
    } else if (command === 'init') {
      exitCode = await runInit(args.slice(1));
    } else {
      console.error(`Unknown command: ${command}`);
      printHelp();
      exitCode = 2;
    }

    process.exit(exitCode);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(2);
  }
}

main();
