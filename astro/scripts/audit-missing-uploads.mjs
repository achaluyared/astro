/** Profiles whose images are missing from WP_UPLOADS_DIR and sites/.../uploads */
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { dataDir, uploadsDir } from './site-paths.mjs';

const wp = process.env.WP_UPLOADS_DIR;
if (!wp) {
  console.error('Set WP_UPLOADS_DIR (use: node --env-file=... scripts/audit-missing-uploads.mjs)');
  process.exit(1);
}

const profiles = JSON.parse(await readFile(join(dataDir(), 'profiles.json'), 'utf8'));
const siteUploads = uploadsDir();

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

const bySlug = new Map();
for (const p of profiles) {
  for (const img of p.images) {
    const ok =
      (await exists(join(wp, img.file))) || (await exists(join(siteUploads, img.file)));
    if (ok) continue;
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, { title: p.title, missing: [], primaryMissing: false });
    const row = bySlug.get(p.slug);
    row.missing.push(img.file);
    if (img.primary) row.primaryMissing = true;
  }
}

console.log(`profiles: ${profiles.length}`);
console.log(`profiles with missing images: ${bySlug.size}`);
let primaryBroken = 0;
for (const row of bySlug.values()) if (row.primaryMissing) primaryBroken++;
console.log(`profiles with missing PRIMARY image: ${primaryBroken}`);
for (const [slug, row] of [...bySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`  ${slug} (${row.title}) — ${row.missing.length} file(s)${row.primaryMissing ? ' [PRIMARY]' : ''}`);
}
