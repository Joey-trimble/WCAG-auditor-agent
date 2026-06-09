import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { AuditReport } from '../types';
import { buildWcagContext } from '../wcag/context';

export function writeWcagContext(report: AuditReport, outputPath: string): void {
  const context = buildWcagContext(report);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(context, null, 2), 'utf-8');
}
