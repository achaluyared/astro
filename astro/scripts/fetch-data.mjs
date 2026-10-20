// Fetches profiles, taxonomies, pages, menus and site info from the WordPress
// "Addis Headless API" plugin and writes them to src/data/*.json.
// Also generates public/_redirects (Netlify / Cloudflare Pages format).
//
// Usage: node --env-file=.env scripts/fetch-data.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { applyProfileImageFixes } from './image-file-fixes.mjs';
import { dataDir, redirectsFile } from './site-paths.mjs';
import http from 'node:http';
import https from 'node:https';

const WP_URL = (process.env.WP_URL || '').replace(/\/$/, '');
const TOKEN = process.env.WP_TOKEN;

if (!WP_URL || !TOKEN) {
  console.error('Missing WP_URL or WP_TOKEN. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (process.env.WP_INSECURE === '1') {
  // Local dev only: LocalWP uses a self-signed certificate.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// node:https instead of fetch so we can force IPv4 (family: 4) for LocalWP.
function get(path) {
  const url = new URL(`${WP_URL}/wp-json/addis/v1/${path}`);
  const lib = url.protocol === 'http:' ? http : https;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      { headers: { 'X-Addis-Token': TOKEN }, family: 4, timeout: 120000 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode !== 200) return reject(new Error(`${path}: HTTP ${res.statusCode} ${body.slice(0, 300)}`));
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`${path}: invalid JSON: ${e.message}`));
          }
        });
      },
    );
    req.on('timeout', () => req.destroy(new Error(`${path}: timeout`)));
    req.on('error', reject);
    req.end();
  });
}

const [site, profilesRes, taxonomies, pages, menus, badges] = await Promise.all([
  get('site'),
  get('profiles?status=publish'),
  get('taxonomies'),
  get('pages'),
  get('menus'),
  get('badges').catch(() => ({ badges: [] })),
]);

const profiles = applyProfileImageFixes(profilesRes.profiles);

/** PP badge indices assigned on listings but missing from ppt_badges export. */
function mergeBadgeCatalog(badgePayload, profileList) {
  const list = Array.isArray(badgePayload?.badges) ? [...badgePayload.badges] : [];
  const known = new Set(list.map((b) => b.id));
  const used = new Set();
  for (const p of profileList) for (const id of p.badges || []) used.add(id);
  const fallback = {
    0: { name: 'Gold', role: 'gold' },
    1: { name: 'Verified', role: 'verified' },
    2: { name: 'VIP', role: 'vip' },
    3: { name: 'VIP', role: 'vip' },
  };
  for (const id of [...used].sort((a, b) => a - b)) {
    if (known.has(id)) continue;
    const fb = fallback[id] ?? { name: `Badge ${id}`, role: 'other' };
    list.push({ id, name: fb.name, role: fb.role });
  }
  list.sort((a, b) => a.id - b.id);
  return { ...badgePayload, badges: list };
}

const badgesMerged = mergeBadgeCatalog(badges, profiles);

const CONTACT_EMAIL = (process.env.CONTACT_EMAIL || 'Info@addisvipgirls.com').trim();
function sanitizePageHtml(html) {
  if (!html) return html;
  return html
    .replace(/Admin@1\.local/gi, CONTACT_EMAIL)
    .replace(/mailto:Admin@1\.local/gi, `mailto:${CONTACT_EMAIL}`);
}
const pagesSanitized = pages.map((p) => ({ ...p, contentHtml: sanitizePageHtml(p.contentHtml) }));

const outDir = dataDir();
await mkdir(outDir, { recursive: true });
const write = (name, data) => writeFile(join(outDir, name), JSON.stringify(data, null, 2));
const SITE_PUBLIC = (process.env.SITE_URL || '').replace(/\/$/, '');
const siteForDisk = { ...site };
if (SITE_PUBLIC) {
  siteForDisk.url = `${SITE_PUBLIC}/`;
  delete siteForDisk.uploadsBaseUrl;
}
if (typeof siteForDisk.uploadsBaseUrl === 'string' && siteForDisk.uploadsBaseUrl.includes('1.local')) {
  delete siteForDisk.uploadsBaseUrl;
}

await Promise.all([
  write('site.json', siteForDisk),
  write('profiles.json', profiles),
  write('taxonomies.json', taxonomies),
  write('pages.json', pagesSanitized),
  write('menus.json', menus),
  write('badges.json', badgesMerged),
]);

// ---- redirects -----------------------------------------------------------
// 1. /{slug}/ -> /escort/{slug}/ (the old short URL the theme redirects today)
// 2. old slugs (both /{old}/ and /escort/{old}/) -> current profile URL
// 3. removed WordPress pages -> home
const lines = [];
const seen = new Set();
/** Retired app routes (not from WordPress). */
const addSiteRedirect = (from, to) => {
  if (seen.has(from)) return;
  seen.add(from);
  lines.push(`${from} ${to} 301`);
};
/** Legacy PremiumPress favorites URL — no saved-list feature on static site; send to home. */
addSiteRedirect('/saved', '/');
addSiteRedirect('/saved/', '/');

const add = (from, to) => {
  if (from === to || seen.has(from)) return false;
  seen.add(from);
  lines.push(`${from} ${to} 301`);
  return true;
};
const current = new Set(profiles.map((p) => p.slug));
// old slug -> profiles that used it. WordPress keeps every old slug forever, so the same
// name can appear on several profiles (e.g. "abeba" on 10 of them).
const claims = new Map();
for (const p of profiles) {
  for (const old of p.legacySlugs) {
    if (!claims.has(old)) claims.set(old, []);
    claims.get(old).push(p.slug);
  }
}
const skippedLive = [];
const ambiguous = [];
for (const p of profiles) {
  const to = p.path.endsWith('/') ? p.path : `${p.path}/`;
  const base = to.split('/').filter(Boolean)[0] ?? 'escort';
  add(`/${p.slug}`, to);
  add(`/${p.slug}/`, to);
  for (const old of p.legacySlugs) {
    // Never redirect over a URL that is a live profile today.
    if (current.has(old)) {
      skippedLive.push({ old, claimedBy: p.slug });
      continue;
    }
    // Several profiles used this old slug: the right target is unknowable, so skip it.
    if (claims.get(old).length > 1) {
      if (!ambiguous.some((a) => a.old === old)) ambiguous.push({ old, profiles: claims.get(old) });
      continue;
    }
    add(`/${old}`, to);
    add(`/${old}/`, to);
    add(`/${base}/${old}`, to);
    add(`/${base}/${old}/`, to);
  }
}
await write('redirects-skipped.json', { skippedBecauseLiveProfileExists: skippedLive, ambiguousOldSlugs: ambiguous });
const removedPages = [
  'my-account', 'add-listing', 'memberships', 'pricing', 'advertising', 'stores', 'callback', 'blog',
  'sample-page', 'how-it-works',
];
for (const s of removedPages) {
  add(`/${s}`, '/');
  add(`/${s}/`, '/');
}
for (const s of ['privacy-policy']) {
  add(`/${s}`, '/privacy/');
  add(`/${s}/`, '/privacy/');
}
for (const feed of ['/feed', '/feed/', '/comments/feed', '/comments/feed/', '/rss', '/rss/']) {
  add(feed, '/');
}

// Empty taxonomy terms → 301 to parent or home. Skip terms that still have profiles
// on a descendant (WordPress parent archives), which Astro builds hierarchically.
const TAX_BASE = { listing: 'escort-category', features: 'features', country: 'country' };

function termSlugScope(terms, term) {
  const scope = new Set([term.slug]);
  const stack = [term.id];
  while (stack.length) {
    const id = stack.pop();
    for (const child of terms) {
      if (child.parent === id) {
        scope.add(child.slug);
        stack.push(child.id);
      }
    }
  }
  return scope;
}

function termHasProfilesInTree(tax, term, terms) {
  const scope = termSlugScope(terms, term);
  return profiles.some((p) => (p.taxonomies[tax] ?? []).some((s) => scope.has(s)));
}

let emptyRedirected = 0;
for (const [tax, data] of Object.entries(taxonomies)) {
  if (tax === 'category' || tax === 'post_tag' || !data.terms) continue;
  const base = data.basePath || TAX_BASE[tax] || tax;
  const bySlug = Object.fromEntries(data.terms.map((t) => [t.slug, t]));
  for (const term of data.terms) {
    if (term.count > 0) continue;
    if (termHasProfilesInTree(tax, term, data.terms)) continue;
    let target = '/';
    let parent = term.parentSlug ? bySlug[term.parentSlug] : null;
    while (parent) {
      if (termHasProfilesInTree(tax, parent, data.terms)) {
        target = `/${base}/${parent.slug}/`;
        break;
      }
      parent = parent.parentSlug ? bySlug[parent.parentSlug] : null;
    }
    const src = `/${base}/${term.slug}`;
    if (add(src, target)) {
      add(src + '/', target);
      emptyRedirected++;
    }
  }
}
console.log(`empty taxonomy terms redirected to parent/home: ${emptyRedirected}`);

await mkdir(join(redirectsFile(), '..'), { recursive: true });
await writeFile(redirectsFile(), lines.join('\n') + '\n');

console.log(`profiles: ${profiles.length}`);
console.log(`taxonomies: ${Object.keys(taxonomies).length}`);
console.log(`pages: ${pages.length}, menus: ${Object.keys(menus).length}`);
console.log(`redirects: ${lines.length}`);
console.log(`old slugs skipped (live profile has that slug): ${skippedLive.length}, ambiguous (several profiles): ${ambiguous.length} -> src/data/redirects-skipped.json`);
