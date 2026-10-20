import fs from 'node:fs';
import path from 'node:path';

const htmlPath = process.argv[2];
const dist = process.argv[3];
const html = fs.readFileSync(htmlPath, 'utf8');
const re = /(?:src|href)="(\/_astro\/[^"]+\.(webp|jpg|jpeg|png))"/gi;
let m;
const seen = new Set();
let bytes = 0;
while ((m = re.exec(html))) {
  if (seen.has(m[1])) continue;
  seen.add(m[1]);
  const fp = path.join(dist, m[1].replace(/^\//, '').replace(/\//g, path.sep));
  try {
    bytes += fs.statSync(fp).size;
  } catch {
    /* missing file */
  }
}
console.log(JSON.stringify({ html: path.basename(htmlPath), uniqueImages: seen.size, totalKb: Math.round(bytes / 1024) }));
