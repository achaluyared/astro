/**
 * Sync + build for one deploy folder under sites/ (massage or VIP).
 *
 *   set ADDIS_SITE_DIR=C:\...\sites\massageinaddisababa
 *   node scripts/run-site.mjs sync|build|all
 *
 * Or use sites/<brand>/UPDATE-SITE.bat
 */
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { astroRoot, distDir, siteRoot } from './site-paths.mjs';

const site = siteRoot();
if (!site) {
  console.error('Set ADDIS_SITE_DIR to your site folder (e.g. sites\\massageinaddisababa).');
  process.exit(1);
}

const envFile = join(site, '.env');
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile} — copy .env.example to .env and fill in WordPress settings.`);
  process.exit(1);
}

const mode = process.argv[2] || 'all';
const env = { ...process.env, ADDIS_SITE_DIR: site };

function run(label, args) {
  console.log(`\n--- ${label} ---`);
  const r = spawnSync(process.execPath, args, { cwd: astroRoot, stdio: 'inherit', env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const nodeEnv = [`--env-file=${envFile}`];

if (mode === 'sync' || mode === 'all') {
  run('fetch', [...nodeEnv, 'scripts/fetch-data.mjs']);
  run('ensure sharp', [...nodeEnv, 'scripts/ensure-sharp.mjs']);
  run('images', [...nodeEnv, 'scripts/sync-images.mjs']);
}

if (mode === 'build' || mode === 'all') {
  run('prepare', [...nodeEnv, 'scripts/prepare-site-data.mjs']);
  run('astro build', [...nodeEnv, join(astroRoot, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build']);
  const mockups = join(distDir(), 'mockups');
  if (existsSync(mockups)) {
    rmSync(mockups, { recursive: true, force: true });
    console.log(`\nRemoved design mockups from deploy output (${mockups})`);
  }
  console.log(`\nDeploy this folder to your host:\n  ${distDir()}\n`);
}

if (!['sync', 'build', 'all'].includes(mode)) {
  console.error('Usage: node scripts/run-site.mjs sync|build|all');
  process.exit(1);
}
