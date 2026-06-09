import type { WcagVersion } from '../types';

const W3C_OVERVIEW = 'https://www.w3.org/WAI/standards-guidelines/wcag/';

export type W3cLinks = {
  overview: string;
  understanding: string;
  quickRef: string;
};

export function getWcagBasePath(version: WcagVersion): string {
  return version === '2.2' ? 'WCAG22' : 'WCAG21';
}

export function buildW3cLinks(criterionId: string, slug: string, version: WcagVersion): W3cLinks {
  const base = getWcagBasePath(version);
  return {
    overview: W3C_OVERVIEW,
    understanding: `https://www.w3.org/WAI/${base}/Understanding/${slug}.html`,
    quickRef: `https://www.w3.org/WAI/${base}/quickref/#${slug}`,
  };
}

export function getReportW3cReferences(version: WcagVersion): W3cLinks {
  const base = getWcagBasePath(version);
  return {
    overview: W3C_OVERVIEW,
    understanding: `https://www.w3.org/WAI/${base}/Understanding/`,
    quickRef: `https://www.w3.org/WAI/${base}/quickref/`,
  };
}
