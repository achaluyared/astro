/**
 * Single local workflow (replaces DEV-SITE.bat + UPDATE-SITE.bat + browser open).
 *
 *   node scripts/run-local.mjs              dev — restart dev + browser
 *   node scripts/run-local.mjs dev
 *   node scripts/run-local.mjs build        sync + build only (upload dist/)
 *   node scripts/run-local.mjs deploy       build + preview + browser
 *
 * Requires ADDIS_SITE_DIR and site .env.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { astroRoot, distDir, siteRoot } from './site-paths.mjs';
import { devPortForBrand, readBrandFromEnvFile } from './dev-port.mjs';

const site = siteRoot();
if (!site) {
  console.error('Set ADDIS_SITE_DIR to your site folder (sites\\addisvipgirls or sites\\massageinaddisababa).');
  process.exit(1);
}

const envFile = join(site, '.env');
if (!existsSync(envFile)) {
  console.error(`Missing ${envFile}`);
  process.exit(1);
}

const mode = (process.argv[2] || 'dev').toLowerCase();
if (!['dev', 'build', 'deploy'].includes(mode)) {
  console.error('Usage: node scripts/run-local.mjs [dev|build|deploy]');
  process.exit(1);
}

const port = devPortForBrand(readBrandFromEnvFile(envFile));
const baseUrl = `http://127.0.0.1:${port}/`;
const env = { ...process.env, ADDIS_SITE_DIR: site };
const nodeEnv = [`--env-file=${envFile}`];
const astroBin = join(astroRoot, 'node_modules', 'astro', 'bin', 'astro.mjs');

function killPort(p) {
  if (process.platform !== 'win32') return;
  spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `$c=Get-NetTCPConnection -LocalPort ${p} -State Listen -ErrorAction SilentlyContinue|Select-Object -Expand OwningProcess -Unique; foreach($pid in $c){ if($pid -gt 0){ Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }`,
    ],
    { stdio: 'ignore' },
  );
}

function waitForPort(p, timeoutMs = 120_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const sock = createConnection({ port: p, host: '127.0.0.1' }, () => {
        sock.end();
        resolve(true);
      });
      sock.on('error', () => {
        sock.destroy();
        if (Date.now() - start > timeoutMs) reject(new Error(`Timed out waiting for port ${p}`));
        else setTimeout(tryOnce, 400);
      });
    };
    tryOnce();
  });
}

let browserOpened = false;
function openBrowser() {
  if (browserOpened) return;
  browserOpened = true;
  console.log(`\nOpening ${baseUrl}\n`);
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', baseUrl], { detached: true, stdio: 'ignore' }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [baseUrl], { detached: true, stdio: 'ignore' }).unref();
  } else {
    spawn('xdg-open', [baseUrl], { detached: true, stdio: 'ignore' }).unref();
  }
}

function npmInstall() {
  console.log('\n--- npm install (optional deps / Sharp) ---\n');
  const npm = spawnSync('npm', ['install', '--include=optional', '--no-audit', '--no-fund'], {
    cwd: astroRoot,
    stdio: 'inherit',
    env,
    shell: true,
  });
  if (npm.status !== 0) process.exit(npm.status ?? 1);
}

function syncAndBuild() {
  console.log('\n--- sync + build ---\n');
  const r = spawnSync(process.execPath, ['scripts/run-site.mjs', 'all'], {
    cwd: astroRoot,
    stdio: 'inherit',
    env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log(`\nUpload to hosting:\n  ${distDir()}\n`);
}

if (mode === 'build') {
  console.log(`Site: ${site}`);
  npmInstall();
  syncAndBuild();
  process.exit(0);
}

if (mode === 'deploy') {
  console.log(`Site: ${site}`);
  npmInstall();
  syncAndBuild();
  killPort(port);
  console.log(`\nStarting preview on port ${port}…\n`);
  const preview = spawn(process.execPath, [...nodeEnv, astroBin, 'preview', '--host', '--port', String(port)], {
    cwd: astroRoot,
    stdio: 'inherit',
    env,
  });
  waitForPort(port)
    .then(openBrowser)
    .catch((e) => console.error(e.message));
  preview.on('exit', (code) => process.exit(code ?? 0));
}

// dev
if (!existsSync(join(site, 'data', 'profiles.json'))) {
  console.error('No synced data yet. Run: RUN-SITE.bat build');
  process.exit(1);
}
killPort(port);
console.log(`Site: ${site}\nDev server on port ${port}…\n`);
const dev = spawn(process.execPath, [...nodeEnv, 'scripts/run-dev.mjs', 'dev', '--host'], {
  cwd: astroRoot,
  stdio: ['inherit', 'pipe', 'inherit'],
  env,
});
dev.stdout?.on('data', (chunk) => {
  process.stdout.write(chunk);
  if (/ready in/i.test(String(chunk))) {
    waitForPort(port).then(openBrowser).catch(() => {});
  }
});
waitForPort(port)
  .then(openBrowser)
  .catch(() => {});
dev.on('exit', (code) => process.exit(code ?? 0));
