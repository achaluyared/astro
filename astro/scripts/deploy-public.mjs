/**
 * Copy sites/.../dist/ → live web root (cPanel public_html).
 * Set ADDIS_PUBLIC_HTML=/home/USER/public_html
 */
import { cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { distDir } from './site-paths.mjs';

const dest = process.env.ADDIS_PUBLIC_HTML?.trim();
if (!dest) {
  console.error('Set ADDIS_PUBLIC_HTML to your public_html path (e.g. /home/addisvhi/public_html)');
  process.exit(1);
}

const src = distDir();
if (!existsSync(src)) {
  console.error(`Missing build output: ${src}. Run sync + build first.`);
  process.exit(1);
}

console.log(`Deploy: ${src} → ${dest}`);
const entries = await readdir(src, { withFileTypes: true });
for (const e of entries) {
  const from = join(src, e.name);
  const to = join(dest, e.name);
  await cp(from, to, { recursive: true, force: true });
}
console.log('Public site updated.');
