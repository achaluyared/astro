// Local static server for dist/ that also honors the public/_redirects rules,
// so you can test redirects (Netlify/Cloudflare format) on your laptop.
// Usage: node scripts/serve.mjs  (port from BRAND or PORT env)
import http from 'node:http';
import { devPortFromEnv } from './dev-port.mjs';
import { createReadStream, existsSync, statSync, readFileSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dist = join(root, 'dist');
const PORT = Number(process.env.PORT) || devPortFromEnv();

// Parse public/_redirects into exact-match rules ("/from /to 301").
const rules = new Map();
const redirFile = join(root, 'public', '_redirects');
if (existsSync(redirFile)) {
  for (const line of readFileSync(redirFile, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const [from, to, code] = t.split(/\s+/);
    if (from && to) rules.set(from, { to, code: Number(code) || 301 });
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.kml': 'application/vnd.google-earth.kml+xml',
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    return send(res, 400, 'bad request');
  }

  // 1. Redirect rules first.
  const rule = rules.get(urlPath) ?? rules.get(urlPath.replace(/\/$/, '')) ?? rules.get(urlPath + '/');
  if (rule) {
    res.writeHead(rule.code, { Location: rule.to });
    return res.end();
  }

  // 2. Static file (exact), then directory index.html (trailing-slash style).
  let file = join(dist, normalize(urlPath).replace(/^([/\\])+/, ''));
  if (existsSync(file) && statSync(file).isFile()) return stream(file, res);
  const asIndex = join(file, 'index.html');
  if (existsSync(asIndex)) return stream(asIndex, res);
  const noSlash = join(dist, urlPath.replace(/\/$/, ''), 'index.html');
  if (existsSync(noSlash)) {
    res.writeHead(301, { Location: urlPath + '/' });
    return res.end();
  }

  // 3. 404.
  const nf = join(dist, '404.html');
  if (existsSync(nf)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return createReadStream(nf).pipe(res);
  }
  send(res, 404, 'not found');
});

function stream(file, res) {
  res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${dist} at http://127.0.0.1:${PORT}/`);
  console.log(`Redirects loaded: ${rules.size}`);
});
