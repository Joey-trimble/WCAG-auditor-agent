import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { AuditorConfig, Impact, PageVariant, WcagLevel, WcagVersion } from './types';

const CONFIG_NAMES = [
  'a11y-auditor.config.ts',
  'a11y-auditor.config.mts',
  'a11y-auditor.config.js',
  'a11y-auditor.config.mjs',
  'a11y-auditor.config.json',
];

const DEFAULT_CONFIG: AuditorConfig = {
  wcag: { version: '2.2', level: 'AA' },
  baseUrl: 'http://localhost:5173',
  routes: [{ path: '/', name: 'Home' }],
  variants: ['default'],
  thresholds: {
    failOn: ['critical', 'serious'],
    maxViolations: 0,
  },
  output: {
    dir: './a11y-reports',
    formats: ['json', 'html'],
  },
};

export function getWcagTags(version: WcagVersion, level: WcagLevel): string[] {
  const tags = new Set<string>(['wcag2a']);

  if (level === 'A' || level === 'AA' || level === 'AAA') {
    if (version === '2.1' || version === '2.2') {
      tags.add('wcag21a');
    }
  }

  if (level === 'AA' || level === 'AAA') {
    tags.add('wcag2aa');
    tags.add('wcag21aa');
    if (version === '2.2') {
      tags.add('wcag22aa');
    }
  }

  if (level === 'AAA') {
    tags.add('wcag2aaa');
    tags.add('wcag21aaa');
    if (version === '2.2') {
      tags.add('wcag22aaa');
    }
  }

  return [...tags];
}

export function mergeConfig(partial: Partial<AuditorConfig>): AuditorConfig {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
    wcag: { ...DEFAULT_CONFIG.wcag, ...partial.wcag },
    thresholds: { ...DEFAULT_CONFIG.thresholds, ...partial.thresholds },
    output: { ...DEFAULT_CONFIG.output, ...partial.output },
    axe: partial.axe ? { ...partial.axe } : undefined,
    auth: partial.auth,
    scenarios: partial.scenarios,
    variants: partial.variants ?? DEFAULT_CONFIG.variants,
    routes: partial.routes ?? DEFAULT_CONFIG.routes,
    baseUrl: partial.baseUrl ?? DEFAULT_CONFIG.baseUrl,
  };
}

export function findConfigPath(cwd: string, explicitPath?: string): string {
  if (explicitPath) {
    const resolved = resolve(cwd, explicitPath);
    if (!existsSync(resolved)) {
      throw new Error(`Config file not found: ${resolved}`);
    }
    return resolved;
  }

  for (const name of CONFIG_NAMES) {
    const candidate = resolve(cwd, name);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `No config found in ${cwd}. Run "a11y-auditor init" or add a11y-auditor.config.ts`,
  );
}

export async function loadConfig(cwd: string, explicitPath?: string): Promise<AuditorConfig> {
  const configPath = findConfigPath(cwd, explicitPath);

  if (configPath.endsWith('.json')) {
    const raw = JSON.parse(readFileSync(configPath, 'utf-8')) as Partial<AuditorConfig>;
    validateConfig(mergeConfig(raw));
    return mergeConfig(raw);
  }

  const { createJiti } = await import('jiti');
  const jiti = createJiti(cwd, { interopDefault: true });
  const loaded = jiti(configPath) as AuditorConfig | { default: AuditorConfig };
  const config = 'default' in loaded && loaded.default ? loaded.default : (loaded as AuditorConfig);

  validateConfig(config);
  return mergeConfig(config);
}

function validateConfig(config: AuditorConfig): void {
  if (!config.baseUrl) {
    throw new Error('Config error: baseUrl is required');
  }
  if (!config.routes?.length) {
    throw new Error('Config error: at least one route is required');
  }
  if (!['2.1', '2.2'].includes(config.wcag?.version)) {
    throw new Error('Config error: wcag.version must be "2.1" or "2.2"');
  }
  if (!['A', 'AA', 'AAA'].includes(config.wcag?.level)) {
    throw new Error('Config error: wcag.level must be "A", "AA", or "AAA"');
  }
}

export function evaluateThresholds(
  report: { findings: { impact: Impact; needsManualReview: boolean }[] },
  config: AuditorConfig,
): boolean {
  const failOn = new Set(config.thresholds?.failOn ?? ['critical', 'serious']);
  const maxViolations = config.thresholds?.maxViolations ?? 0;

  const violations = report.findings.filter((f) => !f.needsManualReview);
  const failing = violations.filter((f) => failOn.has(f.impact));

  if (failing.length > maxViolations) {
    return false;
  }

  return true;
}

export const DEFAULT_VARIANTS: PageVariant[] = ['default', 'dark', 'zoom-200'];
