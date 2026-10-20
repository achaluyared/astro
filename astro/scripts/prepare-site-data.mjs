/**
 * Copy site-specific sync output into astro/src before build.
 * Required when ADDIS_SITE_DIR is set (separate massage vs VIP data/uploads).
 */
import { cp, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { astroRoot, dataDir, headersFile, redirectsFile, siteRoot, uploadsDir } from './site-paths.mjs';

const site = siteRoot();
if (!site) {
  console.log('prepare-site-data: ADDIS_SITE_DIR not set — using data already in astro/src/data');
  process.exit(0);
}

const srcData = join(astroRoot, 'src', 'data');
const srcUploads = join(astroRoot, 'src', 'assets', 'uploads');
const srcPublic = join(astroRoot, 'public');

await mkdir(srcData, { recursive: true });
await mkdir(srcUploads, { recursive: true });

const fromData = dataDir();
try {
  await stat(fromData);
} catch {
  console.error(`Missing synced data at ${fromData}. Run sync first.`);
  process.exit(1);
}

await cp(fromData, srcData, { recursive: true, force: true });
console.log(`data: ${fromData} → ${srcData}`);

try {
  await stat(uploadsDir());
  await cp(uploadsDir(), srcUploads, { recursive: true, force: true });
  console.log(`uploads: ${uploadsDir()} → ${srcUploads}`);
} catch {
  console.warn(`uploads: none at ${uploadsDir()} (images may be missing in build)`);
}

try {
  await stat(redirectsFile());
  await mkdir(srcPublic, { recursive: true });
  await cp(redirectsFile(), join(srcPublic, '_redirects'));
  console.log(`redirects: ${redirectsFile()} → public/_redirects`);
} catch {
  console.warn(`redirects: missing ${redirectsFile()}`);
}

try {
  await stat(headersFile());
  await mkdir(srcPublic, { recursive: true });
  await cp(headersFile(), join(srcPublic, '_headers'));
  console.log(`headers: ${headersFile()} → public/_headers`);
} catch {
  console.warn(`headers: missing ${headersFile()} (optional — see sites/*/_headers)`);
}
