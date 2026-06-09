import type { AuditorConfig, Impact, PageVariant, WcagLevel, WcagVersion } from './types';
export declare function getWcagTags(version: WcagVersion, level: WcagLevel): string[];
export declare function mergeConfig(partial: Partial<AuditorConfig>): AuditorConfig;
export declare function findConfigPath(cwd: string, explicitPath?: string): string;
export declare function loadConfig(cwd: string, explicitPath?: string): Promise<AuditorConfig>;
export declare function evaluateThresholds(report: {
    findings: {
        impact: Impact;
        needsManualReview: boolean;
    }[];
}, config: AuditorConfig): boolean;
export declare const DEFAULT_VARIANTS: PageVariant[];
//# sourceMappingURL=config.d.ts.map