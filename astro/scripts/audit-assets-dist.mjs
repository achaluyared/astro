import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
const samples = (process.argv[3] || 'index.html,search/index.html,escort-category/dinner-companions/index.html,escort/liya/index.html').split(',');

function assetSizes(html, distRoot) {
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  const styles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
  let js = 0;
  let css = 0;
  const missing = [];
  for (const href of scripts) {
    if (!href.startsWith('/')) continue;
    const fp = path.join(distRoot, href.replace(/^\//, '').replace(/\//g, path.sep));
    if (fs.existsSync(fp)) js += fs.statSync(fp).size;
    else missing.push(href);
  }
  for (const href of styles) {
    if (!href.startsWith('/')) continue;
    const fp = path.join(distRoot, href.replace(/^\//, '').replace(/\//g, path.sep));
    if (fs.existsSync(fp)) css += fs.statSync(fp).size;
    else missing.push(href);
  }
  return { js, css, missing };
}

const out = {};
for (const rel of samples) {
  const fp = path.join(dist, rel.replace(/\//g, path.sep));
  if (!fs.existsSync(fp)) {
    out[rel] = { error: 'missing' };
    continue;
  }
  const html = fs.readFileSync(fp, 'utf8');
  const sizes = assetSizes(html, dist);
  out[rel] = {
    jsKb: Math.round(sizes.js / 1024),
    cssKb: Math.round(sizes.css / 1024),
    missing: sizes.missing,
  };
}

const allFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else allFiles.push({ rel: path.relative(dist, p).replace(/\\/g, '/'), size: fs.statSync(p).size });
  }
}
walk(dist);
allFiles.sort((a, b) => b.size - a.size);

console.log(JSON.stringify({ pageAssets: out, largestFiles: allFiles.slice(0, 20) }, null, 2));
