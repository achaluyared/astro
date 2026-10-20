# Auto-deploy on cPanel (cms → astro)

WordPress on **cms.addisvipgirls.com** saves escorts → ~60s later the server rebuilds and publishes to **astro.addisvipgirls.com**.

---

## 1. Upload code (once)

On the server (SSH or File Manager), e.g. **`/home/addisvhi/addis-vip/`**:

```text
addis-vip/
  astro/          ← full repo astro folder (package.json, scripts, src, …)
  sites/
    addisvipgirls/
      .env        ← copy from .env.server (see below)
      data/       ← optional first time; fetch creates it
      uploads/    ← optional; sync fills it
```

Do **not** put this inside `public_html` or the astro site docroot.

---

## 2. Server `.env`

On your PC, edit **`sites/addisvipgirls/.env.server`** (paths + token), then upload it to the server as:

```text
/home/addisvhi/addis-vip/sites/addisvipgirls/.env
```

Fix **`CPANEL_USER`** and folder names if yours differ (File Manager → path bar).

---

## 3. WordPress `wp-config.php` (cms)

Above `/* That's all, stop editing! */`:

```php
define( 'ADDIS_HEADLESS_TOKEN', 'SAME_AS_WP_TOKEN_IN_ENV' );
define( 'ADDIS_LOCAL_REBUILD_URL', 'https://build.addisvipgirls.com/rebuild' );
```

Use the **exact** rebuild URL from step 4 (cPanel may add a path prefix).

---

## 4. cPanel → Setup Node.js App

| Field | Value |
|--------|--------|
| Node.js version | **22.x** |
| Application root | `/home/addisvhi/addis-vip/astro` |
| Application URL | **`build.addisvipgirls.com`** (own docroot, not shared with astro/cms) |
| Application startup file | `scripts/rebuild-listener.mjs` |

**Environment variables** (duplicate critical values from `.env` — Passenger may not load `--env-file`):

| Variable | Value |
|----------|--------|
| `ADDIS_SITE_DIR` | `/home/addisvhi/addis-vip/sites/addisvipgirls` |
| `NODE_ENV` | `production` |

Click **Run NPM Install**, then **Restart**.

---

## 5. Test

**API:**

```bash
curl -s -H "X-Addis-Token: YOUR_TOKEN" "https://cms.addisvipgirls.com/wp-json/addis/v1/site"
```

**Manual full deploy (SSH):**

```bash
cd /home/addisvhi/addis-vip/astro
node --env-file=../sites/addisvipgirls/.env scripts/deploy-from-wp.mjs
```

Check **https://astro.addisvipgirls.com/**.

**Rebuild hook:**

```bash
curl -X POST -H "X-Addis-Token: YOUR_TOKEN" -H "Content-Type: application/json" \
  -d "{}" "https://build.addisvipgirls.com/rebuild"
```

---

## 6. Daily use

- Edit escorts on **cms** → wait **~1 minute** → **astro** updates.
- Or WP admin bar → **Rebuild Astro site**.

---

## Troubleshooting

- **403 on rebuild:** token mismatch between `wp-config` and `.env`.
- **Build OOM:** ask host for more memory or run `deploy-from-wp.mjs` via cron at night.
- **Sharp errors:** SSH `npm install --include=optional` in `astro/`.

See also **`DEPLOY-CPANEL.md`**.
