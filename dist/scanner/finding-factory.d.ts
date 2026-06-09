import type { AuditFinding, AuditorConfig, Impact, PageVariant } from '../types';
type FindingInput = {
    rule: string;
    summary: string;
    description: string;
    selector: string;
    criteria: string[];
    impact: Impact;
    remediation: string;
    needsManualReview?: boolean;
    helpUrl?: string;
};
export declare function createFinding(config: AuditorConfig, ctx: {
    route: string;
    routeName?: string;
    variant: PageVariant;
    scenario?: string;
    source: AuditFinding['source'];
}, detail: FindingInput): AuditFinding;
export {};
//# sourceMappingURL=finding-factory.d.ts.map