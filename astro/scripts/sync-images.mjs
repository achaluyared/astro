// Copies profile images from WordPress uploads into the site uploads folder for
// astro:assets. Optional center watermark (Option A) via Sharp.
//
// Usage: node --env-file=.env scripts/sync-images.mjs
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { platform } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataDir, uploadsDir } from './site-paths.mjs';

const astroRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const uploads = process.env.WP_UPLOADS_DIR;
if (!uploads) {
  console.error('Missing WP_UPLOADS_DIR in .env');
  process.exit(1);
}

const brand = (process.env.BRAND || 'massage').toLowerCase();
const watermarkOn =
  process.env.WATERMARK === '1' || (process.env.WATERMARK !== '0' && brand === 'vip');
const watermarkOpacity = Math.min(1, Math.max(0, Number(process.env.WATERMARK_OPACITY ?? 0.45)));
const watermarkForce = process.env.WATERMARK_FORCE === '1';
const watermarkPath =
  process.env.WATERMARK_SVG?.trim() ||
  join(astroRoot, 'assets', 'watermarks', 'option-a-center.svg');
/** Watermark width as fraction of photo width (center placement). */
const WATERMARK_WIDTH_RATIO = Number(process.env.WATERMARK_WIDTH_RATIO ?? 0.78);

/** @type {typeof import('sharp').default | null} */
let sharp = null;
async function getSharp() {
  if (sharp) return sharp;
  try {
    sharp = (await import('sharp')).default;
    return sharp;
  } catch (err) {
    console.error('Sharp failed to load. Run: node --env-file=<site>/.env scripts/ensure-sharp.mjs');
    throw err;
  }
}

const profiles = JSON.parse(await readFile(join(dataDir(), 'profiles.json'), 'utf8'));
const files = new Set();
for (const p of profiles) for (const img of p.images) files.add(img.file);

/** Sharp/libvips on Windows often fails on paths >= MAX_PATH; Node fs buffers still work. */
function winLongPath(p) {
  return platform() === 'win32' && p.length >= 250;
}

async function sharpFromFile(lib, filePath) {
  if (winLongPath(filePath)) return lib(await readFile(filePath));
  return lib(filePath);
}

async function sharpToFile(pipeline, filePath) {
  if (winLongPath(filePath)) {
    await writeFile(filePath, await pipeline.toBuffer());
    return;
  }
  await pipeline.toFile(filePath);
}

async function watermarkBufferForWidth(photoWidth) {
  const lib = await getSharp();
  const wmWidth = Math.max(120, Math.round(photoWidth * WATERMARK_WIDTH_RATIO));
  const { data, info } = await lib(watermarkPath)
    .resize(wmWidth)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * watermarkOpacity);
  }
  return lib(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function writeWithWatermark(src, dest) {
  const lib = await getSharp();
  const input = await sharpFromFile(lib, src);
  const meta = await input.metadata();
  if (!meta.width) throw new Error('missing width');
  const overlay = await watermarkBufferForWidth(meta.width);
  await mkdir(dirname(dest), { recursive: true });
  await sharpToFile(input.composite([{ input: overlay, gravity: 'center' }]), dest);
}

let copied = 0;
let watermarked = 0;
let skipped = 0;
const missing = [];
let bytes = 0;

for (const rel of files) {
  const src = join(uploads, rel);
  const dest = join(uploadsDir(), rel);
  try {
    const s = await stat(src);
    bytes += s.size;
    let destExists = false;
    try {
      await stat(dest);
      destExists = true;
    } catch {
      /* new file */
    }
    if (destExists && !watermarkForce && !watermarkOn) {
      skipped++;
      continue;
    }
    if (destExists && !watermarkForce && watermarkOn) {
      skipped++;
      continue;
    }

    if (watermarkOn) {
      await writeWithWatermark(src, dest);
      watermarked++;
    } else {
      await mkdir(dirname(dest), { recursive: true });
      await copyFile(src, dest);
      copied++;
    }
  } catch (e) {
    missing.push(rel);
    if (process.env.WATERMARK_DEBUG === '1') console.error(rel, e);
  }
}

console.log(`images referenced: ${files.size}, copied: ${copied}, watermarked: ${watermarked}, skipped: ${skipped}, missing: ${missing.length}`);
if (watermarkOn) {
  console.log(`watermark: ${watermarkPath} @ ${Math.round(watermarkOpacity * 100)}% opacity, center, width ${Math.round(WATERMARK_WIDTH_RATIO * 100)}% of photo`);
  if (skipped && !watermarkForce) {
    console.log('tip: set WATERMARK_FORCE=1 to re-apply watermark on already-synced files');
  }
}
console.log(`total original size: ${(bytes / 1048576).toFixed(1)} MB`);
if (missing.length) console.log('missing files:\n' + missing.join('\n'));
