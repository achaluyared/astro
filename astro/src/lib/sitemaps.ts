import { ATTRIBUTE_TAXONOMIES, profiles, taxonomies, termsWithProfiles } from './data';
import { INDEXABLE_PAGE_PATHS, staticPageSlugs } from './pages';

// Static page routes written by hand (kept in sync with src/pages/*.astro).

type Url = { path: string; lastmod?: string };

// Child sitemap names mirror the Rank Math index on the live site.
const TAX_SITEMAPS: Record<string, string> = { listing: 'listing', features: 'features', country: 'country' };

export function sitemapNames(): string[] {
  const names = ['page', 'listing_type'];
  for (const tax of ATTRIBUTE_TAXONOMIES) if (termsWithProfiles(tax).length) names.push(tax);
  names.push(...Object.values(TAX_SITEMAPS));
  return names;
}

export function sitemapUrls(name: string): Url[] {
  if (name === 'page') {
    const fromWp = staticPageSlugs().map((s) => `/${s}/`);
    const paths = new Set<string>([...INDEXABLE_PAGE_PATHS, ...fromWp]);
    return [...paths].map((path) => ({ path }));
  }
  if (name === 'listing_type') return profiles.map((p) => ({ path: p.path, lastmod: p.updatedAt }));
  const tax = Object.keys(TAX_SITEMAPS).find((k) => TAX_SITEMAPS[k] === name) ?? name;
  if (!taxonomies[tax]) return [];
  const base = taxonomies[tax].basePath;
  const hub = { path: `/${base}/` };
  const terms = termsWithProfiles(tax).map((t) => ({ path: `/${base}/${t.slug}/` }));
  return [hub, ...terms];
}
