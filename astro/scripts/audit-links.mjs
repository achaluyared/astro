import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
if (!dist) {
  console.error('Usage: node audit-links.mjs <dist-dir>');
  process.exit(1);
}

const htmlFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(dist);

const hrefRe = /href=["']([^"'#?]+)["']/gi;
const broken = [];
const localBad = [];
const seen = new Set();

function fileForHref(fromFile, href) {
  if (href.startsWith('/')) {
    const rel = href.replace(/^\//, '').replace(/\/$/, '');
    if (!rel) return path.join(dist, 'index.html');
    const direct = path.join(dist, rel);
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
    return path.join(direct, 'index.html');
  }
  const base = path.dirname(fromFile);
  const resolved = path.normalize(path.join(base, href));
  if (resolved.endsWith('.html')) return resolved;
  return path.join(resolved, 'index.html');
}

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = hrefRe.exec(html))) {
    const h = m[1].trim();
    if (!h || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) continue;
    if (/1\.local|localhost|127\.0\.0\.1/i.test(h)) {
      localBad.push({ page: rel, href: h });
      continue;
    }
    if (h.startsWith('http')) continue;
    const target = fileForHref(file, h);
    if (!fs.existsSync(target)) {
      const key = `${rel} -> ${h}`;
      if (!seen.has(key)) {
        seen.add(key);
        broken.push(key);
      }
    }
  }
}

console.log(JSON.stringify({ htmlFiles: htmlFiles.length, localBad: localBad.length, broken: broken.length, localBadSample: localBad.slice(0, 15), brokenSample: broken.slice(0, 30) }, null, 2));
