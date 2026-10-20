After extract in cPanel File Manager (home folder, NOT astro docroot):

  addis-vip/
    astro/
    sites/addisvipgirls/.env

Full path should match ADDIS_SITE_DIR in .env (e.g. /home/addisvhi/addis-vip/...).

Next: cPanel â†’ Setup Node.js App
  Application root: .../addis-vip/astro
  Startup file: scripts/rebuild-listener.mjs
  URL: build.addisvipgirls.com
  Env vars: see cpanel-node-environment.txt (edit paths; do not commit secrets)

Run NPM Install, Restart. Details: sites/addisvipgirls/DEPLOY-TESTING.md
