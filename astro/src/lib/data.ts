import { z } from 'astro/zod';
import profilesRaw from '../data/profiles.json';
import taxonomiesRaw from '../data/taxonomies.json';
import pagesRaw from '../data/pages.json';
import menusRaw from '../data/menus.json';
import siteRaw from '../data/site.json';

/* ---------------------------------------------------------------- schema */

const Image = z.object({
  id: z.number().nullable(),
  file: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  alt: z.string().nullable(),
  primary: z.boolean(),
});

const Rates = z.record(z.string(), z.number());

const Profile = z.object({
  id: z.number(),
  slug: z.string().min(1),
  path: z.string().regex(/^\/[^/]+\/[^/]+\/$/),
  title: z.string().min(1),
  status: z.enum(['publish', 'expired']),
  publishedAt: z.string(),
  updatedAt: z.string(),
  description: z.string(),
  descriptionHtml: z.string(),
  age: z.number().nullable(),
  heightCm: z.number().nullable(),
  location: z.object({
    country: z.string().nullable(),
    state: z.string().nullable(),
    city: z.string().nullable(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }),
  contact: z.object({
    phone: z.string().nullable(),
    phoneRaw: z.string().nullable(),
    whatsapp: z.string().nullable(),
    telegram: z.string().nullable(),
    telegramUrl: z.string().nullable(),
    website: z.string().nullable(),
    links: z.array(z.object({ type: z.string(), label: z.string(), url: z.string() })).default([]),
  }),
  rates: z.object({ incall: Rates, outcall: Rates }),
  businessHours: z.array(
    z.object({ day: z.number(), open: z.string().nullable(), close: z.string().nullable(), active: z.boolean() }),
  ),
  flags: z.object({
    featured: z.boolean(),
    sponsored: z.boolean(),
    verified: z.boolean(),
    homepage: z.boolean(),
    offline: z.boolean(),
  }),
  dates: z.object({
    listingExpiresAt: z.string().nullable(),
    featuredUntil: z.string().nullable(),
    sponsoredUntil: z.string().nullable(),
    homepageUntil: z.string().nullable(),
  }),
  badges: z.array(z.number()),
  images: z.array(Image),
  taxonomies: z.record(z.string(), z.array(z.string())),
  seo: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    ogImage: z.string().nullable(),
    canonical: z.string(),
  }),
  legacySlugs: z.array(z.string()),
});
export type Profile = z.infer<typeof Profile>;

const Term = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  parent: z.number().nullable(),
  parentSlug: z.string().nullable(),
  description: z.string().nullable(),
  count: z.number(),
  path: z.string(),
});
const Taxonomy = z.object({
  label: z.string(),
  hierarchical: z.boolean(),
  basePath: z.string(),
  terms: z.array(Term),
});
export type Term = z.infer<typeof Term>;
export type Taxonomy = z.infer<typeof Taxonomy>;

const Page = z.object({
  id: z.number(),
  slug: z.string(),
  path: z.string(),
  title: z.string(),
  template: z.string(),
  contentHtml: z.string(),
  updatedAt: z.string(),
  seo: z.object({ title: z.string().nullable(), description: z.string().nullable() }),
});
const Menu = z.object({
  menuId: z.number(),
  name: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.number(),
      parent: z.number().nullable(),
      title: z.string(),
      url: z.string(),
      target: z.string().nullable(),
    }),
  ),
});

/* ------------------------------------------------------------------ data */

// Parsing at import time makes the build fail loudly if the WordPress API shape changes.
export const profiles = z.array(Profile).parse(profilesRaw);
export const taxonomies = z.record(z.string(), Taxonomy).parse(taxonomiesRaw);
export const pages = z.array(Page).parse(pagesRaw);
const menusNormalized =
  Array.isArray(menusRaw) && (menusRaw as unknown[]).length === 0 ? {} : menusRaw;
export const menus = z.record(z.string(), Menu).parse(menusNormalized);
export const wpSite = siteRaw as {
  name: string;
  url: string;
  profileBase?: string;
};

/** Profile URL prefix from WordPress (e.g. `girls`, `escort`). */
export const profileListingBase =
  wpSite.profileBase ??
  (profilesRaw[0] && typeof profilesRaw[0] === 'object' && 'path' in profilesRaw[0]
    ? String((profilesRaw[0] as { path: string }).path).split('/').filter(Boolean)[0]
    : 'escort');

/* -------------------------------------------------------------- helpers */

const buildTime = Date.now();
const active = (flag: boolean, until: string | null) => flag && (!until || Date.parse(until) > buildTime);

export const NEW_PUBLISH_DAYS = 15;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const isFeatured = (p: Profile) => active(p.flags.featured, p.dates.featuredUntil);
export const isSponsored = (p: Profile) => active(p.flags.sponsored, p.dates.sponsoredUntil);
export const isOnHomepage = (p: Profile) => active(p.flags.homepage, p.dates.homepageUntil);

/** “New” badge: published within the last 15 days (not the WP homepage flag). */
export function isNewlyPublished(p: Profile, asOf = buildTime): boolean {
  const published = Date.parse(p.publishedAt);
  if (Number.isNaN(published)) return false;
  return asOf - published <= NEW_PUBLISH_DAYS * MS_PER_DAY;
}

export const RECOMMENDED_COUNT = 16;
export const FEATURED_SLIDER_MAX = 10;

/** Active featured profiles for the carousel (optional subset, e.g. current archive). */
export function featuredProfiles(list: Profile[] = profiles): Profile[] {
  return sortProfiles(list.filter(isFeatured)).slice(0, FEATURED_SLIDER_MAX);
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  let s = seed >>> 0;
  const next = () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seedFromString(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return h >>> 0;
}

/**
 * “Recommended for you” — matches onboarding: new escorts get ~2 months sponsored (Popular).
 * 1) Prefer active sponsored profiles (random pick / order, not publish-date order).
 * 2) If fewer than 16 sponsored, fill from featured → homepage → everyone else (each tier shuffled).
 * 3) Final shuffle so premium members don’t always appear in a fixed block order.
 */
export function recommendedProfiles(current: Profile, list: Profile[] = profiles): Profile[] {
  const seed = seedFromString(current.slug);
  const others = list.filter((r) => r.slug !== current.slug && r.status === 'publish');

  const sponsored = others.filter(isSponsored);
  const featured = others.filter((r) => isFeatured(r) && !isSponsored(r));
  const homepage = others.filter((r) => isOnHomepage(r) && !isFeatured(r) && !isSponsored(r));
  const rest = others.filter((r) => listingTierExclusive(r) === 0);

  const picked: Profile[] = [];
  const takeFrom = (group: Profile[], salt: number) => {
    for (const p of shuffleWithSeed(group, seed + salt)) {
      if (picked.length >= RECOMMENDED_COUNT) return;
      picked.push(p);
    }
  };

  takeFrom(sponsored, 1);
  if (picked.length < RECOMMENDED_COUNT) takeFrom(featured, 2);
  if (picked.length < RECOMMENDED_COUNT) takeFrom(homepage, 3);
  if (picked.length < RECOMMENDED_COUNT) takeFrom(rest, 4);

  return shuffleWithSeed(picked, seed + 5);
}

/** Highest active listing tier for sort / data attributes (exclusive bucket). */
export function listingTierExclusive(p: Profile): number {
  if (isSponsored(p)) return 3;
  if (isFeatured(p)) return 2;
  if (isOnHomepage(p)) return 1;
  return 0;
}

/** Paid / promoted tiers first (sponsored → featured → homepage), then most recently updated. */
function listingTier(p: Profile): number {
  return listingTierExclusive(p);
}

export function sortProfiles(list: Profile[]): Profile[] {
  return [...list].sort(
    (a, b) => listingTier(b) - listingTier(a) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

/** Search / archives: tier blocks in order; shuffle within each tier on the client. */
export function orderProfilesByTier(list: Profile[]): Profile[] {
  const sponsored = list.filter(isSponsored);
  const featured = list.filter((p) => isFeatured(p) && !isSponsored(p));
  const homepage = list.filter((p) => isOnHomepage(p) && !isFeatured(p) && !isSponsored(p));
  const rest = list.filter((p) => listingTierExclusive(p) === 0);
  rest.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return [...sponsored, ...featured, ...homepage, ...rest];
}

export const sortedProfiles = orderProfilesByTier(profiles);

/** Slugs for this term and all descendants (WordPress parent archives include child terms). */
export function termSlugScope(tax: string, slug: string): Set<string> {
  const t = taxonomies[tax];
  if (!t) return new Set([slug]);
  const term = t.terms.find((x) => x.slug === slug);
  if (!term) return new Set([slug]);
  const scope = new Set<string>([slug]);
  const stack = [term.id];
  while (stack.length) {
    const id = stack.pop()!;
    for (const child of t.terms) {
      if (child.parent === id) {
        scope.add(child.slug);
        stack.push(child.id);
      }
    }
  }
  return scope;
}

export function profilesWithTerm(tax: string, slug: string): Profile[] {
  const scope = termSlugScope(tax, slug);
  return orderProfilesByTier(
    profiles.filter((p) => p.taxonomies[tax]?.some((s) => scope.has(s))),
  );
}

/** Terms that should get a static archive (direct or hierarchical match). */
export function termsWithProfiles(tax: string): Term[] {
  const t = taxonomies[tax];
  if (!t) return [];
  return t.terms.filter((term) => profilesWithTerm(tax, term.slug).length > 0);
}

export function termName(tax: string, slug: string): string {
  return taxonomies[tax]?.terms.find((t) => t.slug === slug)?.name ?? slug;
}

/** Resolve WP taxonomy key from public URL segment (`dadrink`, `escort-category`, …). */
export function taxKeyFromBasePath(basePath: string): string | undefined {
  for (const [key, t] of Object.entries(taxonomies)) {
    if (t.basePath === basePath) return key;
  }
  return undefined;
}

/** All published profiles tagged with any term in this taxonomy. */
export function profilesWithAnyInTax(tax: string): Profile[] {
  return orderProfilesByTier(
    profiles.filter((p) => (p.taxonomies[tax]?.length ?? 0) > 0),
  );
}

/** Taxonomies with their own route module (`escort-category`, `features`, `country`). */
export const DEDICATED_ROUTE_TAXONOMIES = ['listing', 'features', 'country'] as const;

/** Every other taxonomy from WordPress → `/\{basePath\}/\{slug\}/` via `[tax]/[slug].astro`. */
export function attributeTaxonomyKeys(): string[] {
  return Object.keys(taxonomies).filter(
    (k) => !(DEDICATED_ROUTE_TAXONOMIES as readonly string[]).includes(k),
  );
}

export const ATTRIBUTE_TAXONOMIES: readonly string[] = attributeTaxonomyKeys();

/** All PremiumPress taxonomies synced from WordPress (hub + term archives). */
export function allTaxonomyKeys(): string[] {
  return Object.keys(taxonomies);
}

/** @deprecated use DEDICATED_ROUTE_TAXONOMIES */
export const TAXONOMY_BASE: Record<string, string> = {
  listing: 'escort-category',
  features: 'features',
  country: 'country',
};

function isInternalMenuHost(hostname: string): boolean {
  if (/\.local$/i.test(hostname)) return true;
  try {
    if (hostname === new URL(wpSite.url).hostname) return true;
  } catch {
    /* ignore */
  }
  const site = import.meta.env.SITE as string | undefined;
  if (site) {
    try {
      const publicHost = new URL(site).hostname;
      if (hostname === publicHost) return true;
      if (publicHost.startsWith('www.') && hostname === publicHost.slice(4)) return true;
      if (hostname.startsWith('www.') && publicHost === hostname.slice(4)) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

/** Menu URL from WordPress (CMS or public site host) to a site-relative path. */
export function menuHref(url: string): { href: string; external: boolean } {
  try {
    const u = new URL(url);
    if (!isInternalMenuHost(u.hostname)) return { href: url, external: true };
    if (u.pathname === '/' && u.search.startsWith('?s=')) return { href: '/search/', external: false };
    return { href: u.pathname + u.search, external: false };
  } catch {
    return { href: url, external: false };
  }
}
