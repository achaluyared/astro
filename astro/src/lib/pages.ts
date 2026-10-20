import { pages } from './data';
import { handwritten } from './handwritten';

/** Public URL path for a WordPress page synced in `pages.json` (e.g. `terms` → `/terms/`). */
export function pagePath(slug: string): string {
  return pages.find((p) => p.slug === slug)?.path ?? `/${slug}/`;
}

/** Terms & privacy stay readable before age verification (same slugs as live WP). */
export const AGE_GATE_EXEMPT_PATHS = new Set([pagePath('terms'), pagePath('privacy')]);

/** WordPress pages that are not rebuilt in Astro (accounts, payments, submissions, blog, defaults) or have custom routes. */
export const REMOVED_PAGES = new Set([
  'my-account', 'add-listing', 'memberships', 'pricing', 'advertising', 'stores', 'callback', 'blog',
  'sample-page', 'privacy-policy', 'countries', 'how-it-works',
]);
/** Pages with their own route file under src/pages. */
export const CUSTOM_ROUTES = new Set(['categories', 'top-listings', 'dmca']);

/** Indexable static routes (for sitemap + audits). */
export const INDEXABLE_PAGE_PATHS = [
  '/',
  '/about-us/',
  '/faq/',
  '/contact/',
  '/testimonials/',
  '/categories/',
  '/top-listings/',
  '/dmca/',
  '/privacy/',
  '/terms/',
] as const;

/** Slugs rendered by src/pages/[slug].astro. */
export function staticPageSlugs(): string[] {
  const slugs = new Set<string>(Object.keys(handwritten));
  for (const p of pages) {
    if (REMOVED_PAGES.has(p.slug) || CUSTOM_ROUTES.has(p.slug)) continue;
    if (p.contentHtml.trim() !== '') slugs.add(p.slug);
  }
  return [...slugs];
}
