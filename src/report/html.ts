import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { AuditFinding, AuditReport, ChecklistItem, FindingGroup } from '../types';
import { formatCriterionHierarchy, summarizeChecklistByPrinciple, WCAG_22_ONLY_CRITERIA_IDS } from '../wcag/hierarchy';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function impactBadge(impact: string): string {
  const colors: Record<string, string> = {
    critical: '#b00020',
    serious: '#e65100',
    moderate: '#f9a825',
    minor: '#616161',
  };
  const color = colors[impact] ?? '#616161';
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;text-transform:uppercase">${escapeHtml(impact)}</span>`;
}

function statusBadge(status: ChecklistItem['status']): string {
  const styles: Record<ChecklistItem['status'], { bg: string; label: string }> = {
    failed: { bg: '#c62828', label: 'Failed' },
    incomplete: { bg: '#6a1b9a', label: 'Incomplete' },
    'automated-pass': { bg: '#2e7d32', label: 'Automated pass' },
    'needs-manual-review': { bg: '#616161', label: 'Manual review' },
  };
  const style = styles[status];
  return `<span style="background:${style.bg};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;white-space:nowrap">${style.label}</span>`;
}

function renderW3cLinks(f: AuditFinding): string {
  if (!f.w3c) {
    return `<a href="${escapeHtml(f.helpUrl)}" target="_blank" rel="noopener">Rule docs</a>`;
  }

  return `
    <a href="${escapeHtml(f.w3c.understanding)}" target="_blank" rel="noopener">Understanding</a> ·
    <a href="${escapeHtml(f.w3c.quickRef)}" target="_blank" rel="noopener">Quick Ref</a> ·
    <a href="${escapeHtml(f.helpUrl)}" target="_blank" rel="noopener">Axe rule</a>`;
}

function renderFinding(f: AuditFinding, checklist: ChecklistItem[]): string {
  const criterionId = f.wcag.criteria.find((id) => id !== 'unknown');
  const checklistItem = criterionId ? checklist.find((c) => c.id === criterionId) : undefined;
  const hierarchy = checklistItem ? formatCriterionHierarchy(checklistItem) : undefined;
  const criterionLabel = f.criterionTitle
    ? `${f.wcag.criteria.join(', ')} — ${escapeHtml(f.criterionTitle)}`
    : escapeHtml(f.wcag.criteria.join(', '));
  const location = f.filePath
    ? `<dt><strong>File</strong></dt><dd><code>${escapeHtml(f.filePath)}${f.line ? `:${f.line}` : ''}</code></dd>`
    : '';

  return `
    <article class="finding" style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px">
      <header style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        ${impactBadge(f.impact)}
        <strong>${escapeHtml(f.summary)}</strong>
        ${f.needsManualReview ? '<span style="color:#6a1b9a">Manual review</span>' : ''}
        ${f.waived ? '<span style="color:#1565c0">Waived</span>' : ''}
      </header>
      <p style="color:#555;margin:0 0 8px">${escapeHtml(f.description)}</p>
      <dl style="margin:0;font-size:14px">
        ${hierarchy ? `<dt><strong>Hierarchy</strong></dt><dd>${escapeHtml(hierarchy)}</dd>` : ''}
        <dt><strong>WCAG</strong></dt><dd>${criterionLabel}</dd>
        <dt><strong>Rule</strong></dt><dd><code>${escapeHtml(f.rule)}</code> <span style="color:#6a7075">(${escapeHtml(f.source)})</span></dd>
        ${location}
        <dt><strong>Route</strong></dt><dd>${escapeHtml(f.route)} (${escapeHtml(f.variant)})</dd>
        <dt><strong>Selector</strong></dt><dd><code>${escapeHtml(f.selector)}</code></dd>
        <dt><strong>W3C references</strong></dt><dd>${renderW3cLinks(f)}</dd>
        ${
          f.guidance
            ? `<dt><strong>How to fix</strong></dt><dd>${escapeHtml(f.guidance.howToFix)}${f.guidance.techniques.length ? `<br><span style="color:#6a7075">Techniques: ${escapeHtml(f.guidance.techniques.join(', '))}</span>` : ''}</dd>`
            : ''
        }
      </dl>
    </article>`;
}

function renderChecklistItem(item: ChecklistItem): string {
  const newBadge = item.introducedIn === '2.2'
    ? ' <span style="font-size:11px;color:#1565c0">(WCAG 2.2)</span>'
    : '';
  const guidanceHint = item.guidance
    ? `<br><span style="color:#6a7075;font-size:12px">${escapeHtml(item.guidance.summary)}</span>`
    : '';

  return `
    <tr>
      <td><code>${escapeHtml(item.id)}</code>${newBadge}</td>
      <td>${escapeHtml(item.title)}${guidanceHint}</td>
      <td>${escapeHtml(item.principle)}</td>
      <td>${statusBadge(item.status)}</td>
      <td style="white-space:nowrap">
        <a href="${escapeHtml(item.w3c.understanding)}" target="_blank" rel="noopener">Understanding</a> ·
        <a href="${escapeHtml(item.w3c.quickRef)}" target="_blank" rel="noopener">Quick Ref</a>
      </td>
    </tr>`;
}

function renderFindingGroup(group: FindingGroup, checklist: ChecklistItem[]): string {
  const checklistItem = checklist.find((c) => c.id === group.criterionId);
  const hierarchy = checklistItem ? formatCriterionHierarchy(checklistItem) : group.criterionTitle ?? group.criterionId;

  return `
    <article class="finding" style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px">
      <header style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        ${impactBadge(group.impact)}
        <strong>${escapeHtml(group.summary)}</strong>
        <span style="color:#1565c0;font-size:13px">${group.instanceCount} instance${group.instanceCount === 1 ? '' : 's'}</span>
      </header>
      <p style="color:#555;margin:0 0 8px"><strong>Hierarchy:</strong> ${escapeHtml(hierarchy)}</p>
      <dl style="margin:0;font-size:14px">
        <dt><strong>Rule</strong></dt><dd><code>${escapeHtml(group.rule)}</code></dd>
        <dt><strong>Routes</strong></dt><dd>${group.routes.map((r) => `<code>${escapeHtml(r)}</code>`).join(', ')}</dd>
        <dt><strong>Selectors</strong></dt><dd>${group.selectors.slice(0, 5).map((s) => `<code>${escapeHtml(s)}</code>`).join(', ')}${group.selectors.length > 5 ? ` +${group.selectors.length - 5} more` : ''}</dd>
        ${group.filePaths.length ? `<dt><strong>Files</strong></dt><dd>${group.filePaths.slice(0, 5).map((f) => `<code>${escapeHtml(f)}</code>`).join(', ')}</dd>` : ''}
      </dl>
    </article>`;
}

export function writeHtmlReport(report: AuditReport, outputPath: string): void {
  const violations = report.findings.filter((f) => !f.needsManualReview);
  const manual = report.findings.filter((f) => f.needsManualReview);
  const statusColor = report.summary.passed ? '#2e7d32' : '#c62828';
  const statusText = report.summary.passed ? 'PASSED' : 'FAILED';
  const checklist = report.wcagChecklist ?? [];
  const checklistSummary = report.checklistSummary;
  const w3c = report.w3cReferences;

  const manualReviewItems = checklist.filter((c) => c.status === 'needs-manual-review');
  const waivedFindings = report.findings.filter((f) => f.waived);
  const principleSummary = summarizeChecklistByPrinciple(checklist);
  const wcag22Items = checklist.filter((c) => WCAG_22_ONLY_CRITERIA_IDS.includes(c.id));
  const findingGroups = report.findingGroups ?? [];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Accessibility Audit — ${escapeHtml(report.meta.baseUrl)}</title>
  <style>
    body { font-family: 'Open Sans', system-ui, sans-serif; margin: 0; background: #f6f6f9; color: #252a2e; }
    main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    h2 { font-size: 1.15rem; margin-bottom: 12px; }
    .meta { color: #6a7075; font-size: 14px; margin-bottom: 24px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 8px; padding: 16px; }
    .card strong { display: block; font-size: 1.5rem; }
    section { margin-bottom: 32px; }
    code { background: #eee; padding: 2px 4px; border-radius: 4px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; font-size: 14px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; vertical-align: top; }
    th { background: #f0f0f3; font-weight: 600; }
    .note { background: #fff; border-left: 4px solid #1565c0; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #444; }
  </style>
</head>
<body>
  <main>
    <h1>WCAG ${escapeHtml(report.meta.wcag.version)} ${escapeHtml(report.meta.wcag.level)} Audit</h1>
    <p class="meta">
      ${escapeHtml(report.meta.baseUrl)} · ${escapeHtml(report.meta.timestamp)} · a11y-auditor-agent v${escapeHtml(report.meta.version)}
      ${w3c ? ` · <a href="${escapeHtml(w3c.overview)}" target="_blank" rel="noopener">W3C WCAG Overview</a>` : ''}
    </p>

    <div class="summary">
      <div class="card" style="border-left:4px solid ${statusColor}">
        <span>Status</span>
        <strong style="color:${statusColor}">${statusText}</strong>
      </div>
      <div class="card"><span>Violations</span><strong>${report.summary.violations}</strong></div>
      <div class="card"><span>Manual review (axe)</span><strong>${report.summary.incomplete}</strong></div>
      <div class="card"><span>Critical</span><strong>${report.summary.byImpact.critical}</strong></div>
      <div class="card"><span>Serious</span><strong>${report.summary.byImpact.serious}</strong></div>
      <div class="card"><span>Waived</span><strong>${report.summary.waived ?? 0}</strong></div>
      ${
        checklistSummary
          ? `<div class="card"><span>Criteria needing manual review</span><strong>${checklistSummary.needsManualReview}</strong></div>`
          : ''
      }
    </div>

    ${
      report.baselineDiff
        ? `<section>
      <h2>Baseline comparison</h2>
      <p class="note">Compared to baseline from ${escapeHtml(report.baselineDiff.baselineTimestamp)}.</p>
      <div class="summary">
        <div class="card"><span>New issues</span><strong style="color:#c62828">${report.baselineDiff.newCount}</strong></div>
        <div class="card"><span>Fixed issues</span><strong style="color:#2e7d32">${report.baselineDiff.fixedCount}</strong></div>
        <div class="card"><span>Violation delta</span><strong>${report.baselineDiff.violationDelta >= 0 ? '+' : ''}${report.baselineDiff.violationDelta}</strong></div>
      </div>
    </section>`
        : ''
    }

    ${
      principleSummary.length
        ? `<section>
      <h2>Coverage by principle</h2>
      <table>
        <thead><tr><th>Principle</th><th>Criteria</th><th>Failed</th><th>Manual review</th><th>Automated pass</th></tr></thead>
        <tbody>
          ${principleSummary.map((p) => `<tr><td>${escapeHtml(p.principle)}</td><td>${p.summary.total}</td><td>${p.summary.failed}</td><td>${p.summary.needsManualReview}</td><td>${p.summary.automatedPass}</td></tr>`).join('')}
        </tbody>
      </table>
    </section>`
        : ''
    }

    ${
      wcag22Items.length
        ? `<section>
      <h2>WCAG 2.2-only criteria</h2>
      <ul>${wcag22Items.map((item) => `<li><strong>${escapeHtml(item.id)}</strong> ${escapeHtml(item.title)} — ${statusBadge(item.status)}</li>`).join('')}</ul>
    </section>`
        : ''
    }

    ${
      report.staticAudit
        ? `<section>
      <h2>Static analysis (Phase 5)</h2>
      <p><strong>${report.staticAudit.filesScanned}</strong> files scanned via ESLint jsx-a11y.</p>
      ${report.staticAudit.warnings.length ? `<ul>${report.staticAudit.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}</ul>` : ''}
    </section>`
        : ''
    }

    ${
      checklistSummary
        ? `<section>
      <h2>WCAG ${escapeHtml(report.meta.wcag.version)} ${escapeHtml(report.meta.wcag.level)} coverage summary</h2>
      <div class="note" style="margin-bottom:16px">
        Full checklist of all ${checklistSummary.total} success criteria at your target level.
        Automated tools cannot test every criterion — items marked <strong>Manual review</strong> need human verification.
        Official references: <a href="${w3c ? escapeHtml(w3c.overview) : '#'}" target="_blank" rel="noopener">WCAG Overview</a>,
        <a href="${w3c ? escapeHtml(w3c.quickRef) : '#'}" target="_blank" rel="noopener">Quick Reference</a>.
      </div>
      <div class="summary" style="margin-bottom:16px">
        <div class="card"><span>Failed</span><strong style="color:#c62828">${checklistSummary.failed}</strong></div>
        <div class="card"><span>Incomplete</span><strong style="color:#6a1b9a">${checklistSummary.incomplete}</strong></div>
        <div class="card"><span>Automated pass</span><strong style="color:#2e7d32">${checklistSummary.automatedPass}</strong></div>
        <div class="card"><span>Needs manual review</span><strong>${checklistSummary.needsManualReview}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Title</th>
            <th>Principle</th>
            <th>Status</th>
            <th>W3C</th>
          </tr>
        </thead>
        <tbody>
          ${checklist.map(renderChecklistItem).join('')}
        </tbody>
      </table>
    </section>`
        : ''
    }

    ${
      report.waivers?.expired.length
        ? `<section>
      <h2>Expired waivers (${report.waivers.expired.length})</h2>
      <p class="note" style="border-left-color:#e65100">These waivers have expired and no longer suppress findings. Renew or fix the underlying issues.</p>
      <ul>${report.waivers.expired.map((w) => `<li><strong>${escapeHtml(w.id)}</strong> — ${escapeHtml(w.reason)} (expired ${escapeHtml(w.expires)}, owner: ${escapeHtml(w.owner)})</li>`).join('')}</ul>
    </section>`
        : ''
    }

    <section>
      <h2>Agent review brief</h2>
      <p class="note">Open <code>a11y-reports/agent-review.md</code> and <code>a11y-reports/wcag-context.json</code> in Cursor for AI-guided fixes. Regenerate with <code>npx a11y-auditor review</code>.</p>
    </section>

    ${
      findingGroups.length
        ? `<section>
      <h2>Grouped violations (${findingGroups.length} patterns)</h2>
      <p class="note">Same rule + criterion grouped across routes. Fix the pattern once to resolve multiple instances.</p>
      ${findingGroups.slice(0, 30).map((g) => renderFindingGroup(g, checklist)).join('')}
    </section>`
        : ''
    }

    ${
      waivedFindings.length
        ? `<section>
      <h2>Waived findings (${waivedFindings.length})</h2>
      <p class="note">These are excluded from CI thresholds. Do not fix unless the waiver expires.</p>
      ${waivedFindings.map((f) => renderFinding(f, checklist)).join('')}
    </section>`
        : ''
    }

    ${
      report.behavioralAudit
        ? `<section>
      <h2>Behavioral checks (Phase 2)</h2>
      <p class="note">ACT-aligned Playwright tests beyond axe: page title, language, landmarks, skip links, reflow, target size, and more.</p>
      <p><strong>${report.behavioralAudit.checksRun}</strong> checks passed. Passed: <code>${report.behavioralAudit.passedChecks.map(escapeHtml).join('</code>, <code>')}</code></p>
    </section>`
        : ''
    }

    <section>
      <h2>Violations (${violations.length})</h2>
      ${violations.length ? violations.map((f) => renderFinding(f, checklist)).join('') : '<p>No automated violations detected.</p>'}
    </section>

    <section>
      <h2>Axe incomplete / manual review queue (${manual.length})</h2>
      ${manual.length ? manual.map((f) => renderFinding(f, checklist)).join('') : '<p>No axe items requiring manual review.</p>'}
    </section>

    ${
      manualReviewItems.length
        ? `<section>
      <h2>Success criteria requiring manual review (${manualReviewItems.length})</h2>
      <p class="note">These WCAG criteria were not fully tested by automation. Review using W3C Understanding docs.</p>
      <ul>
        ${manualReviewItems.map((item) => `<li><strong>${escapeHtml(item.id)} ${escapeHtml(item.title)}</strong> — <a href="${escapeHtml(item.w3c.understanding)}" target="_blank" rel="noopener">Understanding</a></li>`).join('')}
      </ul>
    </section>`
        : ''
    }

    ${
      report.keyboardAudit?.focusOrder.length
        ? `<section>
      <h2>Keyboard focus order</h2>
      <ol>${report.keyboardAudit.focusOrder.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}</ol>
      ${report.keyboardAudit.issues.length ? `<p><strong>Issues:</strong> ${report.keyboardAudit.issues.map(escapeHtml).join('; ')}</p>` : ''}
    </section>`
        : ''
    }
  </main>
</body>
</html>`;

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, 'utf-8');
}
