import type { Page } from '@playwright/test';
import type { AuditFinding, AuditorConfig, PageVariant } from '../types';
export type BehavioralResult = {
    findings: AuditFinding[];
    passedCriteria: string[];
    passedChecks: string[];
};
type CheckContext = {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
};
export declare function runBehavioralChecks(page: Page, config: AuditorConfig, ctx: CheckContext): Promise<BehavioralResult>;
export type NavSignature = {
    route: string;
    links: Array<{
        text: string;
        href: string;
    }>;
};
export declare function extractNavSignature(page: Page, route: string): Promise<NavSignature>;
export declare function runCrossPageChecks(config: AuditorConfig, signatures: NavSignature[]): BehavioralResult;
export {};
//# sourceMappingURL=behavioral.d.ts.map