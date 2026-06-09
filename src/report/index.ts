import { resolve } from 'path';
import type { AuditReport, AuditorConfig } from '../types';
import { writeJsonReport } from './json';
import { writeHtmlReport } from './html';

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

  return written;
}

export { writeJsonReport } from './json';
export { writeHtmlReport } from './html';
