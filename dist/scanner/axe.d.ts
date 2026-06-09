import type { Page } from '@playwright/test';
import type { AuditFinding, AuditorConfig, PageVariant } from '../types';
export declare function runAxeScan(page: Page, config: AuditorConfig, ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
}): Promise<AuditFinding[]>;
export declare function countAxePasses(page: Page, config: AuditorConfig): Promise<number>;
//# sourceMappingURL=axe.d.ts.map