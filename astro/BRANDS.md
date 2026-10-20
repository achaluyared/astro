# Multi-brand headless (one repo, separate deploys)

Each **live site** is one WordPress + one **site folder** + one static deploy. Never sync site `1.local` data and deploy to massageinaddisababa.com.

## Recommended: separate folders under `sites/`

| Deploy folder | Domain |
|---------------|--------|
| [`../sites/massageinaddisababa/`](../sites/massageinaddisababa/) | massageinaddisababa.com |
| [`../sites/addisvipgirls/`](../sites/addisvipgirls/) | addisvipgirls.com |

Each folder has its own `.env`, synced `data/`, `uploads/`, and build output **`dist/`** (upload that to hosting). Run **`UPDATE-SITE.bat`** inside the site folder. See [`../sites/README.md`](../sites/README.md).

## Per-site `.env`

| Variable | Massage | VIP (addisvipgirls) |
|----------|---------|---------------------|
| `BRAND` | `massage` | `vip` |
| `SITE_URL` | `https://massageinaddisababa.com` | `https://addisvipgirls.com` |
| `WP_URL` | That brand’s CMS (e.g. `https://2.local`) | e.g. `https://1.local` |
| `WP_UPLOADS_DIR` | That Local site’s uploads path | … |
| **Local dev port** | **5432** | **4321** |

Then: sync + build via `sites/*/UPDATE-SITE.bat` or `node astro/scripts/run-site.mjs all` with `ADDIS_SITE_DIR` set. Dev: **`DEV-SITE.bat`** in each site folder (port follows `BRAND` in that folder’s `.env`).

## Legacy: single `astro/.env`

Still supported: `npm run sync` → `npm run build` → deploy `astro/dist/`. Data overwrites each sync—use **sites/** when both brands are on one PC.

## What is shared vs brand-specific

| Shared (same code) | Brand-specific (`src/brand/`, `BRAND` env) |
|--------------------|---------------------------------------------|
| Profile page **layout** (`[profileBase]/[slug].astro`) | **Colors** (`src/styles/brands/{massage,vip}.css`) |
| Search, tax archives, API plugin | **Home** layout (`HomeMassage` vs `HomeVip`) |
| Redirect + sitemap **mechanism** | Copy: SEO strings, FAQ, contact, About bodies |
| `profile.path` from WordPress (`/girls/` vs `/escort/`) | Logo wordmark |

## SEO & URLs (same rules as VIP)

- Canonical host = `SITE_URL` at build time.
- Profile URLs = WordPress permalinks in JSON (`path` field); dynamic route builds every path.
- Per-profile title/description prefer Rank Math from WP (`profile.seo`).
- `fetch-data.mjs` generates `public/_redirects` from legacy slugs and empty taxonomies.
- Handwritten static pages keep stable URLs (`/about-us/`, `/faq/`, etc.) with brand-specific content.

## Recommended before production build

1. Assign WP nav menus (massage site currently returns empty menus).
2. Replace `public/images/about/*` with massage-specific art.
3. Confirm contact phone/email on live WP vs `src/brand/massage.ts`.
4. Optional: git branch per brand (`brand/massage`, `brand/vip`) each with committed `.env.example` only; real `.env` stays gitignored.
5. Separate Netlify/CF **projects** + build hooks per domain.

See also [HEADLESS.md](../HEADLESS.md).
