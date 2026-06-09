import type { AuditFinding, AuditReport, ChecklistItem, CriterionGuidance } from '../types';
import {
  formatCriterionHierarchy,
  isWcag22OnlyCriterion,
  summarizeChecklistByPrinciple,
  WCAG_22_ONLY_CRITERIA_IDS,
} from '../wcag/hierarchy';
import { getPlaybookEntry } from '../wcag/playbook';

const IMPACT_ORDER = ['critical', 'serious', 'moderate', 'minor'];

function groupFindingsByCriterion(findings: AuditFinding[]): Map<string, AuditFinding[]> {
  const groups = new Map<string, AuditFinding[]>();

  for (const finding of findings) {
    const criterionId = finding.wcag.criteria.find((id) => id !== 'unknown') ?? 'unknown';
    const list = groups.get(criterionId) ?? [];
    list.push(finding);
    groups.set(criterionId, list);
  }

  return groups;
}

function formatFinding(f: AuditFinding, checklist: ChecklistItem[]): string {
  const criterionId = f.wcag.criteria.find((id) => id !== 'unknown');
  const checklistItem = criterionId ? checklist.find((c) => c.id === criterionId) : undefined;
  const hierarchy = checklistItem
    ? formatCriterionHierarchy(checklistItem)
    : f.criterionTitle ?? criterionId ?? 'unknown';
  const techniques = f.guidance?.techniques.length ? f.guidance.techniques.join(', ') : '';
  const w3c = f.w3c?.understanding ? `[Understanding](${f.w3c.understanding})` : '';

  return `- **${f.impact}** ${f.summary} (\`${f.rule}\`, ${f.source}) on \`${f.route}\` ${f.variant}
  - **Hierarchy:** ${hierarchy}
  - Selector: \`${f.selector}\`
  - ${f.description}
  ${techniques ? `  - **Techniques:** ${techniques}` : ''}
  ${w3c ? `  - ${w3c}` : ''}`;
}

function formatGuidance(g: CriterionGuidance): string {
  const techniques = g.techniques.length ? `\n- **Techniques:** ${g.techniques.join(', ')}` : '';
  return `- **Summary:** ${g.summary}\n- **How to test:** ${g.howToTest}\n- **How to fix:** ${g.howToFix}${techniques}`;
}

function renderCriterionSection(
  item: ChecklistItem,
  findings: AuditFinding[],
  guidance: CriterionGuidance,
): string {
  const w3cLinks = `[Understanding](${item.w3c.understanding}) · [Quick Ref](${item.w3c.quickRef})`;
  const findingBlock = findings.length
    ? `\n**Findings:**\n${findings.map((f) => formatFinding(f, [item])).join('\n')}`
    : '\n*No automated findings — verify manually using guidance below.*';

  const wcag22Note = isWcag22OnlyCriterion(item.id) ? ' · **WCAG 2.2 only**' : '';

  return `### ${item.id} ${item.title} (${item.status})

**Hierarchy:** ${formatCriterionHierarchy(item)}${wcag22Note}
**Level:** ${item.level} · **W3C:** ${w3cLinks}
${findingBlock}

**Agent guidance:**
${formatGuidance(guidance)}
`;
}

export function generateAgentReviewBrief(report: AuditReport): string {
  const { meta, summary, checklistSummary } = report;
  const violations = report.findings.filter((f) => !f.needsManualReview);
  const incomplete = report.findings.filter((f) => f.needsManualReview);
  const grouped = groupFindingsByCriterion(report.findings);
  const checklist = report.wcagChecklist ?? [];

  const priorityFindings = [...violations].sort(
    (a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact),
  );

  const failedCriteria = checklist.filter((c) => c.status === 'failed');
  const manualCriteria = checklist.filter((c) => c.status === 'needs-manual-review');
  const incompleteCriteria = checklist.filter((c) => c.status === 'incomplete');

  const prioritySections = failedCriteria
    .map((item) => {
      const findings = grouped.get(item.id) ?? [];
      const guidance = item.guidance ?? getPlaybookEntry(item.id, item.title);
      return renderCriterionSection(item, findings, guidance);
    })
    .join('\n');

  const manualSections = [...manualCriteria, ...incompleteCriteria]
    .slice(0, 15)
    .map((item) => {
      const findings = grouped.get(item.id) ?? [];
      const guidance = item.guidance ?? getPlaybookEntry(item.id, item.title);
      return renderCriterionSection(item, findings, guidance);
    })
    .join('\n');

  const topViolations = priorityFindings
    .slice(0, 10)
    .map((f, i) => {
      const criterionId = f.wcag.criteria.find((id) => id !== 'unknown');
      const checklistItem = criterionId ? checklist.find((c) => c.id === criterionId) : undefined;
      const hierarchy = checklistItem
        ? formatCriterionHierarchy(checklistItem)
        : f.criterionTitle ?? f.wcag.criteria.join(', ');
      const link = f.w3c?.understanding ? ` — [Understanding](${f.w3c.understanding})` : '';
      const techniques = f.guidance?.techniques.length ? ` · Techniques: ${f.guidance.techniques.join(', ')}` : '';
      return `${i + 1}. **${f.impact}** ${hierarchy}: ${f.summary} (\`${f.selector}\`)${techniques}${link}`;
    })
    .join('\n');

  const principleSummary = summarizeChecklistByPrinciple(checklist)
    .map(
      (p) =>
        `| ${p.principle} | ${p.summary.total} | ${p.summary.failed} | ${p.summary.needsManualReview} | ${p.summary.automatedPass} |`,
    )
    .join('\n');

  const wcag22Section = checklist
    .filter((item) => WCAG_22_ONLY_CRITERIA_IDS.includes(item.id))
    .map((item) => {
      const statusIcon =
        item.status === 'failed'
          ? '❌'
          : item.status === 'automated-pass'
            ? '✅'
            : item.status === 'incomplete'
              ? '⚠️'
              : '🔍';
      return `- ${statusIcon} **${item.id}** ${item.title} — \`${item.status}\``;
    })
    .join('\n');

  const w3c = report.w3cReferences;

  return `# Accessibility Agent Review Brief

> Generated by a11y-auditor-agent v${meta.version} · ${meta.timestamp}
> WCAG ${meta.wcag.version} ${meta.wcag.level} · ${meta.baseUrl}

## Instructions for the agent

You are reviewing accessibility audit results. For each issue:

1. Trace each issue: **Principle → Guideline → Success Criterion → Technique → Fix**
2. Read the **W3C Understanding** link for the success criterion
3. Use **Agent guidance** (summary, how to test, how to fix) below
4. For **WCAG 2.2-only** criteria, confirm the app targets WCAG 2.2 (not 2.1)
5. Propose **concrete code changes** in the consumer's codebase (file paths, components)
6. Do not claim full WCAG conformance — flag items needing human/screen reader verification

**Machine-readable context:** \`a11y-reports/wcag-context.json\` (full hierarchy + 2.2 criteria)

**Official W3C references:**
- [WCAG 2 Overview](${w3c?.overview ?? 'https://www.w3.org/WAI/standards-guidelines/wcag/'})
- [Quick Reference](${w3c?.quickRef ?? 'https://www.w3.org/WAI/WCAG22/quickref/'})

---

## Executive summary

| Metric | Value |
|--------|-------|
| Status | **${summary.passed ? 'PASSED thresholds' : 'FAILED thresholds'}** |
| Violations | ${summary.violations} |
| Incomplete (axe) | ${summary.incomplete} |
| Critical | ${summary.byImpact.critical} |
| Serious | ${summary.byImpact.serious} |
| Waived | ${summary.waived ?? 0} |
${checklistSummary ? `| Criteria failed | ${checklistSummary.failed} |\n| Criteria need manual review | ${checklistSummary.needsManualReview} |` : ''}

### Top violations

${topViolations || '_No violations detected._'}

---

## Coverage by principle

| Principle | Criteria | Failed | Manual review | Automated pass |
|-----------|----------|--------|---------------|----------------|
${principleSummary || '| _No checklist data_ | — | — | — | — |'}

---

## WCAG 2.2-only criteria

These success criteria are **new in WCAG 2.2** — easy to miss when upgrading from 2.1:

${wcag22Section || '_No WCAG 2.2-only criteria in scope._'}

---

## Priority fixes (failed criteria)

${prioritySections || '_No failed criteria._'}

---

## Manual review queue

${manualSections || '_All criteria have automated signal or pass._'}

---

## Axe incomplete items (${incomplete.length})

${incomplete.length ? incomplete.map((f) => formatFinding(f, checklist)).join('\n') : '_None._'}

---

## Keyboard audit

${report.keyboardAudit?.issues.length ? report.keyboardAudit.issues.map((i) => `- ${i}`).join('\n') : '_No keyboard issues detected._'}

${report.keyboardAudit?.focusOrder.length ? `\n**Focus order (first stops):**\n${report.keyboardAudit.focusOrder.slice(0, 10).map((f) => `- ${f}`).join('\n')}` : ''}

---

## Behavioral checks passed

${report.behavioralAudit?.passedChecks.length ? report.behavioralAudit.passedChecks.map((c) => `- ${c}`).join('\n') : '_Behavioral checks not run or none passed._'}

---

*This brief is an engineering aid, not a legal compliance certification. Validate fixes with manual testing and assistive technology.*
`;
}
