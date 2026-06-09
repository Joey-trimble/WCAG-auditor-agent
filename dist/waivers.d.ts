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
export declare function loadWaivers(cwd: string, config: AuditorConfig): WaiverEntry[];
export declare function applyWaivers(findings: AuditFinding[], waivers: WaiverEntry[]): AuditFinding[];
export declare function getActiveWaivers(waivers: WaiverEntry[]): WaiverEntry[];
export declare function getExpiredWaivers(waivers: WaiverEntry[]): WaiverEntry[];
//# sourceMappingURL=waivers.d.ts.map