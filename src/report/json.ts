import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { AuditReport } from '../types';

export function writeJsonReport(report: AuditReport, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
}
