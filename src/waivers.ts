import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { AuditFinding, AuditorConfig } from './types';

export type WaiverEntry = {
  id: string;
  rule?: string;
  criteria?: string[];
  selector?: string;
  route?: string;
  reason: string;
  owner: string;
  expires: string;
};

export type WaiversFile = {
  waivers: WaiverEntry[];
};

const DEFAULT_WAIVERS_FILE = 'a11y-waivers.json';

export function loadWaivers(cwd: string, config: AuditorConfig): WaiverEntry[] {
  const file = config.waivers?.file ?? DEFAULT_WAIVERS_FILE;
  const path = resolve(cwd, file);

  if (!existsSync(path)) {
    return [];
  }

  const raw = JSON.parse(readFileSync(path, 'utf-8')) as WaiversFile;
  if (!Array.isArray(raw.waivers)) {
    throw new Error(`Invalid waivers file ${path}: expected { "waivers": [] }`);
  }

  return raw.waivers;
}

function isWaiverActive(waiver: WaiverEntry, referenceDate = new Date()): boolean {
  const expires = new Date(waiver.expires);
  return !Number.isNaN(expires.getTime()) && expires >= referenceDate;
}

function matchesWaiver(finding: AuditFinding, waiver: WaiverEntry): boolean {
  if (waiver.rule && finding.rule !== waiver.rule) {
    return false;
  }

  if (waiver.criteria?.length) {
    const hasOverlap = waiver.criteria.some((c) => finding.wcag.criteria.includes(c));
    if (!hasOverlap) {
      return false;
    }
  }

  if (waiver.route && finding.route !== waiver.route) {
    return false;
  }

  if (waiver.selector && !finding.selector.includes(waiver.selector)) {
    return false;
  }

  return true;
}

export function applyWaivers(findings: AuditFinding[], waivers: WaiverEntry[]): AuditFinding[] {
  const activeWaivers = waivers.filter((w) => isWaiverActive(w));

  return findings.map((finding) => {
    const match = activeWaivers.find((w) => matchesWaiver(finding, w));
    if (!match) {
      return finding;
    }

    return {
      ...finding,
      waived: true,
      waiverId: match.id,
      waiverReason: match.reason,
    };
  });
}

export function getActiveWaivers(waivers: WaiverEntry[]): WaiverEntry[] {
  return waivers.filter((w) => isWaiverActive(w));
}

export function getExpiredWaivers(waivers: WaiverEntry[]): WaiverEntry[] {
  return waivers.filter((w) => !isWaiverActive(w));
}
