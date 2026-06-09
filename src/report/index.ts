import { resolve } from 'path';
import type { AuditReport, AuditorConfig } from '../types';
import { writeJsonReport } from './json';
import { writeHtmlReport } from './html';
import { writeAgentReviewBrief } from './review';
import { writeSarifReport } from './sarif';
import { writeWcagContext } from './context';

export async function writeReports(report: AuditReport, config: AuditorConfig, cwd: string): Promise<string[]> {
  const outputDir = resolve(cwd, config.output?.dir ?? './a11y-reports');
  const formats = config.output?.formats ?? ['json', 'html'];
  const written: string[] = [];

  if (formats.includes('json')) {
    const jsonPath = resolve(outputDir, 'report.json');
    writeJsonReport(report, jsonPath);
    written.push(jsonPath);
  }

  if (formats.includes('html')) {
    const htmlPath = resolve(outputDir, 'report.html');
    writeHtmlReport(report, htmlPath);
    written.push(htmlPath);
  }

  if (formats.includes('sarif')) {
    const sarifPath = resolve(outputDir, 'report.sarif');
    writeSarifReport(report, sarifPath);
    written.push(sarifPath);
  }

  const reviewPath = resolve(outputDir, 'agent-review.md');
  writeAgentReviewBrief(report, reviewPath);
  written.push(reviewPath);

  const contextPath = resolve(outputDir, 'wcag-context.json');
  writeWcagContext(report, contextPath);
  written.push(contextPath);

  return written;
}

export { writeJsonReport } from './json';
export { writeHtmlReport } from './html';
export { writeAgentReviewBrief } from './review';
export { generateAgentReviewBrief } from '../agent/review-brief';
export { writeSarifReport, buildSarifReport } from './sarif';
export { writeWcagContext } from './context';
export { buildWcagContext } from '../wcag/context';
