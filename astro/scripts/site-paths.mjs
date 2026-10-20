/** Paths for per-site deploy folders (ADDIS_SITE_DIR) vs legacy single astro/.env build. */
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

export const astroRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export function siteRoot() {
  const raw = process.env.ADDIS_SITE_DIR?.trim();
  if (!raw) return null;
  return resolve(raw);
}

export function dataDir() {
  const site = siteRoot();
  return site ? join(site, 'data') : join(astroRoot, 'src', 'data');
}

export function uploadsDir() {
  const site = siteRoot();
  return site ? join(site, 'uploads') : join(astroRoot, 'src', 'assets', 'uploads');
}

export function redirectsFile() {
  const site = siteRoot();
  return site ? join(site, '_redirects') : join(astroRoot, 'public', '_redirects');
}

export function headersFile() {
  const site = siteRoot();
  return site ? join(site, '_headers') : join(astroRoot, 'public', '_headers');
}

export function distDir() {
  const site = siteRoot();
  return site ? join(site, 'dist') : join(astroRoot, 'dist');
}
