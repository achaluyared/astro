/**
 * Dev server for one site folder: copy synced data into astro/src, then astro dev.
 *
 *   set ADDIS_SITE_DIR=...\sites\massageinaddisababa
 *   node scripts/run-dev.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { astroRoot, siteRoot } from './site-paths.mjs';
import { devPortForBrand, readBrandFromEnvFile } from './dev-port.mjs';
import { printDevLanUrls } from './dev-lan-info.mjs';

const site = siteRoot();
if (!site) {
  console.error('Set ADDIS_SITE_DIR to your site folder.');
  process.exit(1);
}

const envFile = join(site, '.env');
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile}`);
  process.exit(1);
}

const env = { ...process.env, ADDIS_SITE_DIR: site };
const nodeEnv = [`--env-file=${envFile}`];

console.log(`Site: ${site}`);
console.log('Preparing synced data for dev…');
let r = spawnSync(process.execPath, [...nodeEnv, 'scripts/prepare-site-data.mjs'], {
  cwd: astroRoot,
  stdio: 'inherit',
  env,
});
if (r.status !== 0) process.exit(r.status ?? 1);

const args = process.argv.slice(2);
const port = String(devPortForBrand(readBrandFromEnvFile(envFile)));
let devArgs = args.length ? [...args] : ['dev', '--host'];
if (!devArgs.includes('--port')) {
  devArgs = [...devArgs, '--port', port];
}
printDevLanUrls(Number(port));
console.log(`\nStarting astro ${devArgs.join(' ')}…\n`);
r = spawnSync(process.execPath, [...nodeEnv, join(astroRoot, 'node_modules', 'astro', 'bin', 'astro.mjs'), ...devArgs], {
  cwd: astroRoot,
  stdio: 'inherit',
  env,
});
process.exit(r.status ?? 0);
