# Astro frontend (PremiumPress headless)

Static site generated from WordPress via the **Addis Headless API** plugin. See **[../HEADLESS.md](../HEADLESS.md)** for multi-site setup (addisvipgirls.com, massageinaddisababa.com, addisgirls.com, etc.).

## Quick start

```bash
cp .env.example .env   # set WP_URL, WP_TOKEN, WP_UPLOADS_DIR, SITE_URL
npm install
npm run sync           # JSON + images from WordPress
npm run build          # output in dist/
npm run dev            # local preview
```

On Windows: **`UPDATE-SITE.bat`** runs sync + build + `astro dev --host`.

## Docs

| File | Contents |
|------|----------|
| [../HEADLESS.md](../HEADLESS.md) | WordPress plugin, env vars, per-brand checklist |
| [DESIGN.md](./DESIGN.md) | VIP UI, components, mockups |
| [AGENTS.md](./AGENTS.md) | Dev server background mode, Astro links |

## Stack

Astro 7, Tailwind v4, GLightbox (profile gallery), Fontsource, view transitions (`ClientRouter`).
