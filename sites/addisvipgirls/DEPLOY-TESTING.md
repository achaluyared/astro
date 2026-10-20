# Testing deploy — astro (headless) + cms (WordPress)

You are **not** on the main domain yet. Use only these two URLs:

| URL | What it is |
|-----|------------|
| **https://astro.addisvipgirls.com** | Public **static** site (Astro `dist/`) — what visitors test |
| **https://cms.addisvipgirls.com** | **WordPress** admin + API — where you edit escorts |

Do **not** share document root between `astro`, `cms`, and `build` subdomains.

---

## Phase A — One-time: WordPress (cms)

1. Subdomain **cms** → own folder (e.g. `/home/addisvhi/cms.addisvipgirls.com`).
2. Install WordPress + PremiumPress.
3. Upload **`wp-plugin/addis-headless-api.php`** → **`wp-content/mu-plugins/`**.
4. **`wp-config.php`** (see **`wp-config-snippet.php`** in this folder):
   - `ADDIS_HEADLESS_TOKEN`
   - `ADDIS_LOCAL_REBUILD_URL` → your Node rebuild URL (Phase C)

Test:

```text
GET https://cms.addisvipgirls.com/wp-json/addis/v1/site
Header: X-Addis-Token: your-token
```

---

## Phase B — First static site (manual, optional)

If Node is not ready yet:

1. On PC: **`sites/addisvipgirls/.env`** with  
   `SITE_URL=https://astro.addisvipgirls.com`  
   `WP_URL=https://cms.addisvipgirls.com`
2. **`RUN-SITE.bat build`**
3. Zip/upload **`dist/`** into **astro** docroot (e.g. `/home/addisvhi/astro.addisvipgirls.com`).

Skip this once auto-deploy works.

---

## Phase C — Node.js on cPanel (auto-deploy)

### C1. Subdomain for the rebuild app

1. Create **`build.addisvipgirls.com`** (or **`rebuild.addisvipgirls.com`**).
2. **Own document root** — not shared with astro or cms.
3. This URL is only for WordPress to POST “rebuild”; users never browse it.

### C2. Upload project code

Outside all site docroots, e.g. **`/home/addisvhi/addis-vip/`**:

```text
addis-vip/
  astro/                    ← package.json lives here
  sites/addisvipgirls/
    .env                    ← from .env.server (edit paths first)
```

Upload via Git, SFTP, or File Manager (zip and extract).

### C3. Server `.env`

Copy **`sites/addisvipgirls/.env.server`** → server  
**`/home/addisvhi/addis-vip/sites/addisvipgirls/.env`**

Edit these to match **File Manager** paths:

```env
SITE_URL=https://astro.addisvipgirls.com
WP_URL=https://cms.addisvipgirls.com
WP_TOKEN=same as wp-config ADDIS_HEADLESS_TOKEN
WP_UPLOADS_DIR=/home/addisvhi/cms.addisvipgirls.com/wp-content/uploads
ADDIS_PUBLIC_HTML=/home/addisvhi/astro.addisvipgirls.com
```

If cms lives in `public_html/cms`, use that path for uploads instead.

### C4. Setup Node.js App (cPanel)

1. **Software** → **Setup Node.js App** → **Create Application**.
2. **Node.js version:** **22** (or highest 22.x).
3. **Application mode:** Production.
4. **Application root:** `/home/addisvhi/addis-vip/astro`
5. **Application URL:** `build.addisvipgirls.com` (the subdomain from C1).
6. **Application startup file:** `scripts/rebuild-listener.mjs`
7. **Create**.

### C5. Environment variables (same screen)

Add each line from **`cpanel-node-environment.txt`** (fix paths/username).

Minimum required:

- `ADDIS_SITE_DIR` = `/home/addisvhi/addis-vip/sites/addisvipgirls`
- `SITE_URL`, `WP_URL`, `WP_TOKEN`
- `WP_UPLOADS_DIR`, `ADDIS_PUBLIC_HTML`

### C6. Install & start

1. **Run NPM Install** (in the Node app panel).
2. **Restart** the application.
3. Open **log / stderr** if status is not running.

### C7. Wire WordPress (cms)

In **`wp-config.php`** on **cms**:

```php
define( 'ADDIS_LOCAL_REBUILD_URL', 'https://build.addisvipgirls.com/rebuild' );
```

Use the **exact** URL cPanel shows (some hosts add a path like `/rebuild` on a different base — copy from the Node app “Open app” URL and add `/rebuild`).

### C8. Test auto-deploy

**SSH** (if available):

```bash
cd /home/addisvhi/addis-vip/astro
node --env-file=../sites/addisvipgirls/.env scripts/deploy-from-wp.mjs
```

Then open **https://astro.addisvipgirls.com/**.

**Webhook:**

```bash
curl -X POST -H "X-Addis-Token: YOUR_TOKEN" -H "Content-Type: application/json" \
  -d "{}" "https://build.addisvipgirls.com/rebuild"
```

**WordPress:** edit an escort → wait ~60s, or admin bar → **Rebuild Astro site**.

---

## Phase D — What you should see when testing

- **cms** → `/wp-admin/` works; API returns JSON with token.
- **astro** → home, escort profiles, images (after sync).
- **build** → POST only; browser may show “Not found” on GET — that is OK.

---

## When you go live later

1. Change **`SITE_URL`** to `https://addisvipgirls.com`.
2. Set **`ADDIS_PUBLIC_HTML`** to apex **`public_html`**.
3. Rebuild once; retire or keep **astro.** as staging.

---

## Local files in this repo

| File | Use |
|------|-----|
| `.env.server` | Template for server `.env` |
| `cpanel-node-environment.txt` | Paste into cPanel Node env |
| `wp-config-snippet.php` | Paste into cms wp-config |
| `AUTO-DEPLOY-CPANEL.md` | Full reference |
