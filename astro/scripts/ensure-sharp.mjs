/**
 * Fail fast with fix steps when Sharp’s native binary is missing (common on Windows
 * after EPERM during npm install or blocked install scripts).
 *
 *   node --env-file=../sites/addisvipgirls/.env scripts/ensure-sharp.mjs
 */
const brand = (process.env.BRAND || 'massage').toLowerCase();
const watermarkOn =
  process.env.WATERMARK === '1' || (process.env.WATERMARK !== '0' && brand === 'vip');

if (!watermarkOn) {
  process.exit(0);
}

try {
  const { default: sharp } = await import('sharp');
  await sharp({ create: { width: 1, height: 1, channels: 3, background: '#000' } })
    .png()
    .toBuffer();
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('\nSharp is required for VIP photo watermarks but could not load.\n');
  console.error(msg);
  console.error(`
Fix (run from the astro folder, close any running UPDATE-SITE / node first):

  cd astro
  npm install --include=optional sharp @img/sharp-win32-x64@0.34.5

If npm reports blocked install scripts (allow-scripts):

  npm approve-scripts sharp
  npm rebuild sharp

If you see EPERM or EBUSY on libvips DLLs, close Node/Local WP, then delete
  node_modules\\sharp
  node_modules\\@img
and run npm install --include=optional again.

Docs: https://sharp.pixelplumbing.com/install
`);
  process.exit(1);
}
