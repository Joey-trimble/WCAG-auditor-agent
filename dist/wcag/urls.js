"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWcagBasePath = getWcagBasePath;
exports.buildW3cLinks = buildW3cLinks;
exports.getReportW3cReferences = getReportW3cReferences;
const W3C_OVERVIEW = 'https://www.w3.org/WAI/standards-guidelines/wcag/';
function getWcagBasePath(version) {
    return version === '2.2' ? 'WCAG22' : 'WCAG21';
}
function buildW3cLinks(criterionId, slug, version) {
    const base = getWcagBasePath(version);
    return {
        overview: W3C_OVERVIEW,
        understanding: `https://www.w3.org/WAI/${base}/Understanding/${slug}.html`,
        quickRef: `https://www.w3.org/WAI/${base}/quickref/#${slug}`,
    };
}
function getReportW3cReferences(version) {
    const base = getWcagBasePath(version);
    return {
        overview: W3C_OVERVIEW,
        understanding: `https://www.w3.org/WAI/${base}/Understanding/`,
        quickRef: `https://www.w3.org/WAI/${base}/quickref/`,
    };
}
//# sourceMappingURL=urls.js.map