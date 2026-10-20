@echo off
REM Merged into RUN-SITE.bat — this forwards for old shortcuts.
call "%~dp0RUN-SITE.bat" build %*
exit /b %ERRORLEVEL%
