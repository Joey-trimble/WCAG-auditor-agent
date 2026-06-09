import type { Page } from '@playwright/test';
import type { AuditFinding, AuditorConfig, PageVariant } from '../types';
export type KeyboardAuditResult = {
    focusOrder: string[];
    issues: string[];
    findings: AuditFinding[];
};
export declare function runKeyboardAudit(page: Page, config: AuditorConfig, ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
}): Promise<KeyboardAuditResult>;
//# sourceMappingURL=keyboard.d.ts.map