/** Shared deploy pipeline for listener + CLI; returns { ok, message }. */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { astroRoot, siteRoot } from './site-paths.mjs';

export function runDeployPipeline() {
  const site = siteRoot();
  if (!site) {
    return Promise.resolve({ ok: false, message: 'ADDIS_SITE_DIR not set' });
  }
  if (!existsSync(join(site, '.env'))) {
    return Promise.resolve({ ok: false, message: 'Missing site .env' });
  }

  const envFile = join(site, '.env');
  const nodeEnv = [`--env-file=${envFile}`];

  return new Promise((resolve) => {
    const child = spawn(process.execPath, [...nodeEnv, 'scripts/deploy-from-wp.mjs'], {
      cwd: astroRoot,
      env: { ...process.env, ADDIS_SITE_DIR: site },
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      resolve({
        ok: code === 0,
        message: code === 0 ? 'Sync, build, and deploy finished' : `Pipeline failed (exit ${code})`,
      });
    });
  });
}
