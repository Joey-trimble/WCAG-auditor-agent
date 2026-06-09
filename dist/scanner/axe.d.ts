import type { Page } from '@playwright/test';
import type { AuditFinding, AuditorConfig, PageVariant } from '../types';
export declare function extractWcagCriteria(tags: string[]): string[];
export type AxeScanResult = {
    findings: AuditFinding[];
    passedCriteria: string[];
    passRuleCount: number;
};
export declare function runAxeScan(page: Page, config: AuditorConfig, ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
}): Promise<AxeScanResult>;
//# sourceMappingURL=axe.d.ts.map