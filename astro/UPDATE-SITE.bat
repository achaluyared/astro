@echo off
title Update Addis Site (legacy astro/.env)
cd /d "%~dp0"

echo NOTE: For separate massage vs VIP deploy folders, use:
echo   sites\massageinaddisababa\UPDATE-SITE.bat
echo   sites\addisvipgirls\UPDATE-SITE.bat
echo.

echo ============================================
echo   Updating site from WordPress...
echo ============================================
echo.

echo [1/3] Syncing data + images from WordPress...
call npm run sync
if errorlevel 1 (
    echo.
    echo *** SYNC FAILED - see errors above ***
    pause
    exit /b 1
)

echo.
echo [2/3] Building static site...
call npm run build
if errorlevel 1 (
    echo.
    echo *** BUILD FAILED - see errors above ***
    pause
    exit /b 1
)

echo.
echo [3/3] Starting Astro dev server (LAN)...

REM Stop any process already on port 5432
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5432" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Dev server with --host so phones on the same Wi-Fi can connect
start "Addis Astro Dev" cmd /k "cd /d %~dp0 && npx astro dev --host --port 5432"

REM Wait for it to come up, then open browser on this PC
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5432/"

echo.
echo ============================================
echo   DONE! Sync + build finished.
echo   Astro dev is running in the other window.
echo   On this PC:  http://127.0.0.1:5432/
echo   On your phone: use the "Network" URL shown in that window
echo   (same Wi-Fi as this PC, e.g. http://192.168.x.x:5432/)
echo ============================================
echo.
pause
