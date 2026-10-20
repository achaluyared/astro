# Center watermark mockups (VIP)

Three SVG designs for **center** placement on **3:4 portrait** escort photos.

**Stack (every option):**
1. **Site title** — Addis VIP Escorts (or all-caps variant)
2. **Site domain** — addisvipgirls.com / ADDISVIPGIRLS.COM

## Preview

Open **`preview.html`** in Chrome/Edge/Firefox. Use the opacity slider (~24% default).

Path: `astro/design/watermarks/preview.html`

## Options

| File | Look |
|------|------|
| `option-a-mark-only.svg` | Serif title + gold rule + spaced domain; faint dark panel |
| `option-b-wordmark.svg` | All-caps title + bar + lowercase domain; outline text, no panel |
| `option-c-lockup.svg` | “A” monogram above rounded card with title + domain |

## Production (sync / Sharp)

- Position: **center** (`gravity: center` in Sharp composite).
- Scale: ~**70–85%** of image width for the SVG bounding box on typical 1200px-long-edge photos.
- Opacity: **45%** (`WATERMARK_OPACITY=0.45`) for **Option A** in production sync.
- Massage brand: duplicate set with `massageinaddisababa.com` when needed.
