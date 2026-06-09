import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { generateAgentReviewBrief } from '../agent/review-brief';
import type { AuditReport } from '../types';

export function writeAgentReviewBrief(report: AuditReport, outputPath: string): void {
  const markdown = generateAgentReviewBrief(report);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, markdown, 'utf-8');
}
