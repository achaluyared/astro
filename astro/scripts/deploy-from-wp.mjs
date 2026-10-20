/**
 * Full server pipeline: WordPress → fetch → images → Astro build → optional public_html.
 * Used by rebuild-listener.mjs and cPanel cron.
 *
 *   set ADDIS_SITE_DIR=...\sites\addisvipgirls
 *   node --env-file=...\.env scripts/deploy-from-wp.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { astroRoot, siteRoot } from './site-paths.mjs';

const site = siteRoot();
if (!site) {
  console.error('Set ADDIS_SITE_DIR');
  process.exit(1);
}

const envFile = join(site, '.env');
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile}`);
  process.exit(1);
}

const env = { ...process.env, ADDIS_SITE_DIR: site };
const nodeEnv = [`--env-file=${envFile}`];

function run(label, args) {
  console.log(`\n--- ${label} ---\n`);
  const r = spawnSync(process.execPath, args, { cwd: astroRoot, stdio: 'inherit', env });
  if (r.status !== 0) {
    console.error(`\n*** ${label} failed ***\n`);
    process.exit(r.status ?? 1);
  }
}

run('sync + build', [...nodeEnv, 'scripts/run-site.mjs', 'all']);

if (process.env.ADDIS_PUBLIC_HTML?.trim()) {
  run('deploy to public_html', [...nodeEnv, 'scripts/deploy-public.mjs']);
} else {
  console.log('\n(Skip public deploy — set ADDIS_PUBLIC_HTML on the server to auto-publish dist/)\n');
}

console.log('\nDone.\n');
