import fs from 'node:fs';
import path from 'node:path';

const dist = process.argv[2];
const missing = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html') && !p.includes('mockups')) {
      const h = fs.readFileSync(p, 'utf8');
      if (!/<meta name="description"/i.test(h)) missing.push(path.relative(dist, p).replace(/\\/g, '/'));
    }
  }
}
walk(dist);
console.log(JSON.stringify(missing, null, 2));
