@echo off
title Addis VIP — rebuild listener (for WP admin button)
set "ADDIS_SITE_DIR=%~dp0"
set "ADDIS_SITE_DIR=%ADDIS_SITE_DIR:~0,-1%"
cd /d "%~dp0..\..\astro"
if not exist "%ADDIS_SITE_DIR%\.env" (
  echo Missing .env
  pause
  exit /b 1
)
echo Keep this open while editing WordPress. Admin bar: Rebuild Astro site
node --env-file="%ADDIS_SITE_DIR%\.env" scripts/rebuild-listener.mjs
pause
