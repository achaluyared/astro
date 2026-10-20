@echo off
title Addis VIP Girls
set "ADDIS_SITE_DIR=%~dp0"
set "ADDIS_SITE_DIR=%ADDIS_SITE_DIR:~0,-1%"
cd /d "%~dp0..\..\astro"

if not exist "%ADDIS_SITE_DIR%\.env" (
  echo Missing %ADDIS_SITE_DIR%\.env — copy .env.example to .env
  pause
  exit /b 1
)

set "MODE=%~1"
if "%MODE%"=="" set "MODE=dev"

if /i "%MODE%"=="help" (
  echo.
  echo   RUN-SITE.bat           Dev server + open browser ^(default^)
  echo   RUN-SITE.bat dev       Same
  echo   RUN-SITE.bat build     Sync WordPress + build dist ^(upload to host^)
  echo   RUN-SITE.bat deploy    Build + preview in browser
  echo.
  pause
  exit /b 0
)

node scripts/run-local.mjs %MODE%
if errorlevel 1 (
  echo.
  echo *** FAILED ***
  pause
  exit /b 1
)

if /i "%MODE%"=="build" pause
