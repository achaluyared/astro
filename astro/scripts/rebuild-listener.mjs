/**
 * HTTP trigger: WordPress → sync + build + (optional) public_html.
 *
 * Local PC:
 *   LISTEN-REBUILD.bat
 *   wp-config: ADDIS_LOCAL_REBUILD_URL = http://127.0.0.1:9847/rebuild
 *
 * cPanel Node:
 *   Startup file: scripts/rebuild-listener.mjs
 *   Env: ADDIS_SITE_DIR, WP_*, ADDIS_PUBLIC_HTML=/home/USER/public_html
 *   wp-config: ADDIS_LOCAL_REBUILD_URL = https://build.yourdomain.com/rebuild
 */
import http from 'node:http';
import { runDeployPipeline } from './deploy-pipeline.mjs';
import { siteRoot } from './site-paths.mjs';

const site = siteRoot();
if (!site) {
  console.error('Set ADDIS_SITE_DIR');
  process.exit(1);
}

const token = (process.env.WP_TOKEN || process.env.ADDIS_HEADLESS_TOKEN || '').trim();
const port = Number(process.env.PORT || process.env.ADDIS_REBUILD_PORT || 9847);
const host = process.env.PORT ? '0.0.0.0' : (process.env.ADDIS_REBUILD_HOST || '127.0.0.1');

let busy = false;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Addis-Token');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url !== '/rebuild' && req.url !== '/rebuild/') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('POST only');
    return;
  }
  if (token) {
    const sent = (req.headers['x-addis-token'] || '').toString();
    if (sent !== token) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
  }
  if (busy) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, message: 'Deploy already running' }));
    return;
  }
  busy = true;
  res.writeHead(202, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true, message: 'Deploy started' }));
  const result = await runDeployPipeline();
  busy = false;
  console.log('[rebuild-listener]', result.message);
});

server.listen(port, host, () => {
  console.log(`Rebuild listener: http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}/rebuild`);
  console.log(`Site: ${site}`);
  if (process.env.ADDIS_PUBLIC_HTML?.trim()) {
    console.log(`Publish to: ${process.env.ADDIS_PUBLIC_HTML.trim()}`);
  } else {
    console.log('Tip: set ADDIS_PUBLIC_HTML on the server to copy dist/ → public_html automatically.');
  }
  console.log('WordPress: save escort / admin bar “Rebuild Astro site” (debounced ~60s) or POST /rebuild\n');
});
