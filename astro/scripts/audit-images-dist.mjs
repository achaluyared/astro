import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
if (!dist) process.exit(1);

const htmlFiles = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(dist);

const imgTag = /<img\b[^>]*>/gi;
const hotlink = [];
const missingAlt = [];
const missingDims = [];
const lazyFirst = [];

for (const file of htmlFiles) {
  const rel = path.relative(dist, file).replace(/\\/g, '/');
  if (rel.startsWith('mockups/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const mainIdx = html.indexOf('id="site-main"');
  const slice = mainIdx >= 0 ? html.slice(mainIdx) : html;
  let firstInMain = true;
  let m;
  while ((m = imgTag.exec(slice))) {
    const tag = m[0];
    const src = tag.match(/\ssrc="([^"]+)"/)?.[1] ?? '';
    if (/1\.local|localhost|wp-content\/uploads/i.test(src)) hotlink.push({ rel, src: src.slice(0, 120) });
    if (!/\salt=/.test(tag) || /\salt=""\s*/.test(tag)) missingAlt.push(rel);
    if (!/\swidth=/.test(tag) || !/\sheight=/.test(tag)) missingDims.push(rel);
    const loading = tag.match(/\sloading="([^"]+)"/)?.[1];
    const fetchp = tag.match(/\sfetchpriority="([^"]+)"/)?.[1];
    if (firstInMain && loading === 'lazy') lazyFirst.push(rel);
    if (firstInMain) firstInMain = false;
  }
}

const large = [];
function walkFiles(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkFiles(p);
    else if (/\.(webp|jpg|jpeg|png|gif|avif)$/i.test(e.name)) {
      const st = fs.statSync(p);
      if (st.size > 300 * 1024) large.push({ rel: path.relative(dist, p).replace(/\\/g, '/'), kb: Math.round(st.size / 1024) });
    }
  }
}
walkFiles(dist);
large.sort((a, b) => b.kb - a.kb);

console.log(
  JSON.stringify(
    {
      hotlinkCount: hotlink.length,
      hotlinkSample: hotlink.slice(0, 5),
      missingAltPages: new Set(missingAlt).size,
      missingDimsPages: new Set(missingDims).size,
      lazyFirstVisiblePages: new Set(lazyFirst).size,
      lazyFirstSample: [...new Set(lazyFirst)].slice(0, 8),
      imagesOver300kb: large.length,
      largestImages: large.slice(0, 15),
    },
    null,
    2,
  ),
);
