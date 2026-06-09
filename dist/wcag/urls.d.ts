import type { WcagVersion } from '../types';
export type W3cLinks = {
    overview: string;
    understanding: string;
    quickRef: string;
};
export declare function getWcagBasePath(version: WcagVersion): string;
export declare function buildW3cLinks(criterionId: string, slug: string, version: WcagVersion): W3cLinks;
export declare function getReportW3cReferences(version: WcagVersion): W3cLinks;
//# sourceMappingURL=urls.d.ts.map