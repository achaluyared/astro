import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
const siteHost = process.argv[3] || 'https://addisvipgirls.com';
if (!dist) {
  console.error('Usage: node audit-seo-dist.mjs <dist> [siteHost]');
  process.exit(1);
}

const htmlFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(dist);

const titles = new Map();
const descs = new Map();
const issues = [];
let noTitle = 0;
let noDesc = 0;
let badCanonical = 0;
let noCanonical = 0;
let h1Counts = { zero: 0, multi: 0, one: 0 };
let noindexPages = [];
let ogMissingImage = 0;
let ogPages = 0;
let jsonLdInvalid = 0;
let jsonLdCount = 0;

const titleRe = /<title>([^<]*)<\/title>/i;
const descRe = /<meta name="description" content="([^"]*)"/i;
const canonRe = /<link rel="canonical" href="([^"]*)"/i;
const robotsRe = /<meta name="robots" content="([^"]*)"/i;
const ogImgRe = /<meta property="og:image" content="([^"]*)"/i;
const h1Re = /<h1[\s>]/gi;
const ldRe = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  if (rel.startsWith('mockups/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const t = html.match(titleRe)?.[1]?.trim();
  const d = html.match(descRe)?.[1]?.trim();
  const c = html.match(canonRe)?.[1]?.trim();
  const robots = html.match(robotsRe)?.[1] ?? '';
  const og = html.match(ogImgRe)?.[1];

  if (!t) noTitle++;
  else {
    if (!titles.has(t)) titles.set(t, []);
    titles.get(t).push(rel);
  }
  if (!d) noDesc++;
  else {
    const len = d.length;
    if (len < 50 || len > 160) issues.push({ type: 'desc-len', rel, len });
    if (!descs.has(d)) descs.set(d, []);
    descs.get(d).push(rel);
  }
  if (t && (t.length < 10 || t.length > 70)) issues.push({ type: 'title-len', rel, len: t.length, title: t.slice(0, 80) });

  if (!c) noCanonical++;
  else if (!c.startsWith(siteHost) || !c.startsWith('https://')) badCanonical++;
  else if (siteHost.includes('addisvipgirls') && !c.endsWith('/') && !c.endsWith('.html')) {
    /* trailing slash policy: allow 404.html exception */
    if (!rel.includes('404')) issues.push({ type: 'canon-slash', rel, c });
  }

  if (/noindex/i.test(robots)) noindexPages.push(rel);

  const h1m = html.match(h1Re);
  const h1n = h1m ? h1m.length : 0;
  if (h1n === 0) h1Counts.zero++;
  else if (h1n === 1) h1Counts.one++;
  else h1Counts.multi++;

  if (og) ogPages++;
  else if (!rel.includes('404') && !robots.includes('noindex')) ogMissingImage++;

  let m;
  while ((m = ldRe.exec(html))) {
    jsonLdCount++;
    try {
      JSON.parse(m[1]);
    } catch {
      jsonLdInvalid++;
      issues.push({ type: 'jsonld', rel });
    }
  }
}

const dupTitles = [...titles.entries()].filter(([, v]) => v.length > 1).slice(0, 15);
const dupDescs = [...descs.entries()].filter(([, v]) => v.length > 1).slice(0, 10);

console.log(
  JSON.stringify(
    {
      pagesScanned: htmlFiles.length,
      contentPages: htmlFiles.length - htmlFiles.filter((f) => f.includes('mockups')).length,
      noTitle,
      noDesc,
      noCanonical,
      badCanonical,
      h1Counts,
      noindexCount: noindexPages.length,
      noindexSample: noindexPages.slice(0, 8),
      ogPages,
      ogMissingImageApprox: ogMissingImage,
      jsonLdCount,
      jsonLdInvalid,
      duplicateTitleGroups: dupTitles.length,
      duplicateTitleSample: dupTitles.map(([t, pages]) => ({ title: t, count: pages.length, sample: pages[0] })),
      duplicateDescGroups: dupDescs.length,
      issueSamples: issues.slice(0, 25),
    },
    null,
    2,
  ),
);
