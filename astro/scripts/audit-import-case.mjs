import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'src');
const re = /from ['"](\.[^'"]+)['"]/g;
const bad = [];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(astro|ts|tsx|js|mjs)$/.test(e.name)) {
      const text = fs.readFileSync(p, 'utf8');
      let m;
      while ((m = re.exec(text))) {
        const rel = m[1];
        if (!rel.startsWith('.')) continue;
        const base = path.dirname(p);
        const candidates = [
          path.join(base, rel),
          path.join(base, rel + '.ts'),
          path.join(base, rel + '.astro'),
          path.join(base, rel, 'index.ts'),
          path.join(base, rel, 'index.astro'),
        ];
        const ok = candidates.some((c) => {
          try {
            fs.accessSync(c);
            return true;
          } catch {
            return false;
          }
        });
        if (!ok) bad.push({ file: path.relative(root, p).replace(/\\/g, '/'), import: rel });
      }
    }
  }
}
walk(root);
console.log(JSON.stringify({ mismatches: bad.length, sample: bad.slice(0, 10) }, null, 2));
