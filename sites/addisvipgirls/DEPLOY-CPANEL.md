# Deploy on cPanel (WordPress + static Astro)

**Testing now?** Use **`DEPLOY-TESTING.md`** — **astro.addisvipgirls.com** (headless) + **cms.addisvipgirls.com** (WordPress) + Node on **build.*** subdomain.

One cPanel account hosts **two things**:

| Role | Technology | Public URL (example) |
|------|------------|----------------------|
| **CMS** | WordPress + PremiumPress + Addis Headless API | `https://cms.addisvipgirls.com` |
| **Static (headless) site** | Astro `dist/` | **`https://astro.addisvipgirls.com`** (staging) → later **`https://addisvipgirls.com`** |

Visitors use the **static** subdomain (or apex after cutover). WordPress stays on **cms** only.

### Staging layout (`astro` + `cms`)

1. Subdomain **`cms`** → own docroot → WordPress (do **not** share docroot with `astro`).
2. Subdomain **`astro`** → own docroot (e.g. `/home/addisvhi/astro.addisvipgirls.com`) → upload **`dist/`** here.
3. In **`sites/addisvipgirls/.env`**:  
   `SITE_URL=https://astro.addisvipgirls.com`  
   `WP_URL=https://cms.addisvipgirls.com`
4. Auto-deploy: `ADDIS_PUBLIC_HTML=/home/addisvhi/astro.addisvipgirls.com` (that folder’s path, not `public_html`).
5. When ready for launch: change **`SITE_URL`** to `https://addisvipgirls.com`, rebuild, deploy to apex **`public_html`**.

---

## Overview (order of work)

1. Create subdomain + install WordPress (CMS).
2. Install headless plugin + `wp-config.php` secrets.
3. Point main domain `public_html` at Astro **after** first build (or use temp domain until ready).
4. Production `.env` on your PC (or on server if using Node).
5. **Build** (`RUN-SITE.bat build`) → upload **`dist/`** to `public_html`.
6. Redirects, 404, headers on the host.
7. *(Optional)* Node.js app for rebuild webhook from WP admin.

---

## Part A — WordPress (CMS subdomain)

### A1. Subdomain

1. cPanel → **Domains** → **Subdomains** (or **Domains** → create subdomain).
2. Subdomain: **`cms`** → document root e.g. `public_html/cms` or `cms.addisvipgirls.com` folder.
3. Wait for DNS (often automatic on same cPanel account).

### A2. Install WordPress

1. cPanel → **WordPress Manager** (Softaculous) → install on **`cms.addisvipgirls.com`**.
2. Use a strong admin password; enable HTTPS (AutoSSL / Let’s Encrypt).

### A3. PremiumPress + content

1. Install/activate your **PremiumPress** theme/plugins as on local.
2. Import or sync escorts, taxonomies, pages (migration plugin, manual, or copy DB from staging).

### A4. Headless API plugin

1. Upload **`wp-plugin/addis-headless-api.php`** to:
   ```text
   wp-content/mu-plugins/addis-headless-api.php
   ```
   Create folder **`mu-plugins`** if missing.

2. Edit **`wp-config.php`** (above “That’s all, stop editing”):

   ```php
   define( 'ADDIS_HEADLESS_TOKEN', 'paste-long-random-string-here' );

   // Optional: Netlify/Cloudflare build hook (production host)
   // define( 'ADDIS_BUILD_HOOK_URL', 'https://...' );

   // Optional: rebuild on your PC (local listener)
   // define( 'ADDIS_LOCAL_REBUILD_URL', 'http://127.0.0.1:9847/rebuild' );

   // Optional: rebuild via cPanel Node app (Part D)
   // define( 'ADDIS_LOCAL_REBUILD_URL', 'https://build.addisvipgirls.com/rebuild' );
   ```

3. Test API in browser or curl (must return JSON, not 401):

   ```bash
   curl -s -H "X-Addis-Token: YOUR_TOKEN" "https://cms.addisvipgirls.com/wp-json/addis/v1/site"
   ```

---

## Part B — Production build (your PC — recommended)

You do **not** need Node on cPanel for the public site. Build on Windows, upload static files.

### B1. Production `.env`

Copy `sites/addisvipgirls/.env.example` → **`sites/addisvipgirls/.env`** (never commit):

```env
BRAND=vip
SITE_URL=https://addisvipgirls.com

WP_URL=https://cms.addisvipgirls.com
WP_TOKEN=same-as-ADDIS_HEADLESS_TOKEN
# No WP_INSECURE on production (omit or set 0)

# If WP runs on the SAME cPanel server, use Linux path to uploads, e.g.:
# WP_UPLOADS_DIR=/home/USERNAME/cms.addisvipgirls.com/wp-content/uploads
# If you build only on PC and WP is remote, sync must reach uploads — often easiest:
# run fetch against live WP URL; copy uploads via SFTP once, or mount path if SSH build on server.
```

For **build on your PC** with WP on cPanel: set `WP_URL` to live CMS; **`WP_UPLOADS_DIR`** must point to a folder that contains the image files (download `wp-content/uploads` via SFTP to a local path, or run image sync on the server — see Part D).

### B2. Install deps (once per machine)

```powershell
cd C:\Users\Get\Projects\addis-elite-massage\astro
npm install --include=optional
```

### B3. Sync + build

Double-click:

```text
sites\addisvipgirls\RUN-SITE.bat build
```

Or:

```powershell
cd astro
$env:ADDIS_SITE_DIR = "C:\Users\Get\Projects\addis-elite-massage\sites\addisvipgirls"
node scripts/run-local.mjs build
```

Output: **`sites\addisvipgirls\dist\`**

### B4. Upload to main domain

1. cPanel → **File Manager** → **`public_html`** (for `addisvipgirls.com`).
2. **Delete or backup** old site files if replacing a live site.
3. Upload **contents** of `dist/` (not the `dist` folder itself): `index.html`, `escort/`, `_astro/`, `_redirects`, `_headers`, `404.html`, sitemaps, etc.
4. Or use **FTP/SFTP** (FileZilla) — same target.

### B5. After every content change (without auto-deploy)

Only if you **did not** set up Part D below: build on PC and upload **`dist/`** manually.

---

## Part D — Auto rebuild when you edit escorts (recommended)

WordPress already **schedules a rebuild ~60 seconds** after you save an escort, page, or menu. You only need a **Node app on cPanel** that runs fetch → build → copy to **`public_html`**.

### D1. Upload project (once)

Outside `public_html`, e.g. **`/home/addisvhi/addis-vip/`**:

- `astro/` (full folder with `package.json`)
- `sites/addisvipgirls/` (include `.env` — **not** in git)

### D2. Server `.env` (in `sites/addisvipgirls/.env`)

```env
BRAND=vip
SITE_URL=https://addisvipgirls.com
WP_URL=https://cms.addisvipgirls.com
WP_TOKEN=same-as-ADDIS_HEADLESS_TOKEN-in-wp-config
WP_UPLOADS_DIR=/home/addisvhi/cms.addisvipgirls.com/wp-content/uploads
ADDIS_PUBLIC_HTML=/home/addisvhi/public_html
```

Use your real CMS path and username (`addisvhi`).

### D3. Node.js app (cPanel → Setup Node.js App)

| Setting | Value |
|---------|--------|
| Node | **22.x** |
| Application root | `/home/addisvhi/addis-vip/astro` |
| Application URL | **`build.addisvipgirls.com`** (own docroot — do **not** share `public_html`) |
| Startup file | **`scripts/rebuild-listener.mjs`** |

**Environment variables** (same as `.env` plus):

| Name | Value |
|------|--------|
| `ADDIS_SITE_DIR` | `/home/addisvhi/addis-vip/sites/addisvipgirls` |

Run **NPM Install** in the panel, then **Restart**.

SSH test (optional):

```bash
cd ~/addis-vip/astro
npm install --include=optional
node --env-file=../sites/addisvipgirls/.env scripts/deploy-from-wp.mjs
```

### D4. WordPress `wp-config.php`

```php
define( 'ADDIS_HEADLESS_TOKEN', 'your-token' );
define( 'ADDIS_LOCAL_REBUILD_URL', 'https://build.addisvipgirls.com/rebuild' );
```

Use the exact URL cPanel shows for the Node app (path may include a prefix).

### D5. What happens when you work

1. You add/edit an escort on **`cms.addisvipgirls.com`**.
2. After **~60 seconds**, WordPress POSTs to **`/rebuild`**.
3. Server runs: **fetch** → **images** → **Astro build** → **copy `dist/` → `public_html`**.
4. Or click **Rebuild Astro site** in the admin bar for immediate trigger.

No PC build required.

### D6. If build fails on shared hosting

- Check Node app **error log** (memory limit, Sharp, timeout).
- Ask host to raise **memory** or use **cron** fallback every 15 min:

  ```bash
  cd /home/addisvhi/addis-vip/astro && /opt/alt/.../node --env-file=../sites/addisvipgirls/.env scripts/deploy-from-wp.mjs
  ```

---

## Part E — Host configuration (main domain)

### C1. HTTPS

- cPanel → **SSL/TLS** / AutoSSL for `addisvipgirls.com`.

### C2. Custom 404

Static build outputs **`404.html`** at root (not `404/index.html`).

- **Cloudflare Pages:** set custom 404 to `/404.html`.
- **Apache (cPanel):** in `public_html/.htaccess` (if allowed):

  ```apache
  ErrorDocument 404 /404.html
  ```

### C3. Redirects (`_redirects`)

The build copies **`sites/addisvipgirls/_redirects`** → **`dist/_redirects`**.

- **Netlify / Cloudflare Pages:** native support.
- **Apache cPanel:** convert rules or use cPanel **Redirects** for critical paths; full `_redirects` may need Cloudflare in front or manual `.htaccess` rewrite rules.

Spot-check old URLs: `/escort/old-slug/` → new profile, `/privacy-policy/` → `/privacy/`, etc.

### C4. Security headers (`_headers`)

File **`dist/_headers`** is generated from `sites/addisvipgirls/_headers`.

- **Cloudflare:** transform rules or Pages `_headers`.
- **Apache:** map important headers in `.htaccess` or use Cloudflare.

### C5. Do not expose WordPress on the main domain

Keep admin only on **`cms.addisvipgirls.com`**. The static site has no `wp-admin`.

---

## Part F — Local dev workflow (unchanged)

| Script | Purpose |
|--------|---------|
| `RUN-SITE.bat` | Dev + browser |
| `RUN-SITE.bat build` | Sync + build for upload |
| `RUN-SITE.bat deploy` | Build + preview locally |
| `LISTEN-REBUILD.bat` | WP admin rebuild → PC (with `ADDIS_LOCAL_REBUILD_URL=http://127.0.0.1:9847/rebuild`) |

---

## Part G — Pre-launch checklist

- [ ] `SITE_URL` and canonicals use **`https://addisvipgirls.com`**
- [ ] Legal pages show **`Info@addisvipgirls.com`**, not `Admin@1.local`
- [ ] **`npm run check`** / build with zero errors
- [ ] **`audit-links.mjs`** on `dist/` — 0 broken internal links
- [ ] All profile images present (no missing uploads after sync)
- [ ] Watermarks applied (VIP) in `sites/.../uploads/`
- [ ] **`_redirects`** deployed; test 5–10 old URLs
- [ ] **`404.html`** works on host
- [ ] Safari / mobile smoke test
- [ ] Rotate **`WP_TOKEN`** if it was ever shared

See also **`prelaunch-audit.md`** in repo root.

---

## Quick reference

```text
CMS:     https://cms.addisvipgirls.com/wp-admin/
API:     https://cms.addisvipgirls.com/wp-json/addis/v1/site
Live:    https://addisvipgirls.com/          ← contents of dist/
Build:   sites\addisvipgirls\RUN-SITE.bat build
Upload:  dist/* → public_html/
```
