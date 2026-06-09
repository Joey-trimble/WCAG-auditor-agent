import type { AuditReport, AuditorConfig } from './types';
export declare function audit(config: AuditorConfig): Promise<AuditReport>;
export declare function auditUrl(url: string, options?: Partial<AuditorConfig>): Promise<AuditReport>;
//# sourceMappingURL=audit.d.ts.map