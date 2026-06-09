"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeHtmlReport = writeHtmlReport;
const fs_1 = require("fs");
const path_1 = require("path");
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function impactBadge(impact) {
    const colors = {
        critical: '#b00020',
        serious: '#e65100',
        moderate: '#f9a825',
        minor: '#616161',
    };
    const color = colors[impact] ?? '#616161';
    return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;text-transform:uppercase">${escapeHtml(impact)}</span>`;
}
function renderFinding(f) {
    return `
    <article class="finding" style="border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-bottom:12px">
      <header style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        ${impactBadge(f.impact)}
        <strong>${escapeHtml(f.summary)}</strong>
        ${f.needsManualReview ? '<span style="color:#6a1b9a">Manual review</span>' : ''}
      </header>
      <p style="color:#555;margin:0 0 8px">${escapeHtml(f.description)}</p>
      <dl style="margin:0;font-size:14px">
        <dt><strong>WCAG</strong></dt><dd>${escapeHtml(f.wcag.criteria.join(', '))}</dd>
        <dt><strong>Rule</strong></dt><dd><code>${escapeHtml(f.rule)}</code></dd>
        <dt><strong>Route</strong></dt><dd>${escapeHtml(f.route)} (${escapeHtml(f.variant)})</dd>
        <dt><strong>Selector</strong></dt><dd><code>${escapeHtml(f.selector)}</code></dd>
        <dt><strong>Help</strong></dt><dd><a href="${escapeHtml(f.helpUrl)}" target="_blank" rel="noopener">${escapeHtml(f.helpUrl)}</a></dd>
      </dl>
    </article>`;
}
function writeHtmlReport(report, outputPath) {
    const violations = report.findings.filter((f) => !f.needsManualReview);
    const manual = report.findings.filter((f) => f.needsManualReview);
    const statusColor = report.summary.passed ? '#2e7d32' : '#c62828';
    const statusText = report.summary.passed ? 'PASSED' : 'FAILED';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Accessibility Audit — ${escapeHtml(report.meta.baseUrl)}</title>
  <style>
    body { font-family: 'Open Sans', system-ui, sans-serif; margin: 0; background: #f6f6f9; color: #252a2e; }
    main { max-width: 960px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .meta { color: #6a7075; font-size: 14px; margin-bottom: 24px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .card { background: #fff; border-radius: 8px; padding: 16px; }
    .card strong { display: block; font-size: 1.5rem; }
    section { margin-bottom: 32px; }
    code { background: #eee; padding: 2px 4px; border-radius: 4px; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <h1>WCAG ${escapeHtml(report.meta.wcag.version)} ${escapeHtml(report.meta.wcag.level)} Audit</h1>
    <p class="meta">${escapeHtml(report.meta.baseUrl)} · ${escapeHtml(report.meta.timestamp)} · a11y-auditor-agent v${escapeHtml(report.meta.version)}</p>

    <div class="summary">
      <div class="card" style="border-left:4px solid ${statusColor}">
        <span>Status</span>
        <strong style="color:${statusColor}">${statusText}</strong>
      </div>
      <div class="card"><span>Violations</span><strong>${report.summary.violations}</strong></div>
      <div class="card"><span>Manual review</span><strong>${report.summary.incomplete}</strong></div>
      <div class="card"><span>Critical</span><strong>${report.summary.byImpact.critical}</strong></div>
      <div class="card"><span>Serious</span><strong>${report.summary.byImpact.serious}</strong></div>
    </div>

    <section>
      <h2>Violations (${violations.length})</h2>
      ${violations.length ? violations.map(renderFinding).join('') : '<p>No automated violations detected.</p>'}
    </section>

    <section>
      <h2>Manual review queue (${manual.length})</h2>
      ${manual.length ? manual.map(renderFinding).join('') : '<p>No items requiring manual review.</p>'}
    </section>

    ${report.keyboardAudit?.focusOrder.length
        ? `<section>
      <h2>Keyboard focus order</h2>
      <ol>${report.keyboardAudit.focusOrder.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}</ol>
      ${report.keyboardAudit.issues.length ? `<p><strong>Issues:</strong> ${report.keyboardAudit.issues.map(escapeHtml).join('; ')}</p>` : ''}
    </section>`
        : ''}
  </main>
</body>
</html>`;
    (0, fs_1.mkdirSync)((0, path_1.dirname)(outputPath), { recursive: true });
    (0, fs_1.writeFileSync)(outputPath, html, 'utf-8');
}
//# sourceMappingURL=html.js.map