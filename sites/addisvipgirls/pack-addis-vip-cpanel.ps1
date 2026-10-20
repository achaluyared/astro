# Build addis-vip-cpanel.zip for cPanel (Node auto-deploy). Run from repo root or this folder.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$outZip = Join-Path $PSScriptRoot 'addis-vip-cpanel.zip'
$stage = Join-Path $env:TEMP ('addis-vip-pack-' + [guid]::NewGuid().ToString())
$dest = Join-Path $stage 'addis-vip'

New-Item -ItemType Directory -Path (Join-Path $dest 'astro') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $dest 'sites\addisvipgirls') -Force | Out-Null

# Exclude generated WP data/images (server fetch + sync recreates them)
$astroEx = @('node_modules', 'dist', '.astro', 'lighthouse-out', 'uploads', 'data')
robocopy (Join-Path $root 'astro') (Join-Path $dest 'astro') /E /XD $astroEx /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy astro failed: $LASTEXITCODE" }

# dist/uploads/data are recreated by deploy-from-wp on the server
$siteEx = @('dist', 'uploads', 'data')
robocopy (Join-Path $root 'sites\addisvipgirls') (Join-Path $dest 'sites\addisvipgirls') /E /XD $siteEx /XF .env .env.server *.zip /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy site failed: $LASTEXITCODE" }

$envServer = Join-Path $root 'sites\addisvipgirls\.env.server'
if (Test-Path $envServer) {
  Copy-Item $envServer (Join-Path $dest 'sites\addisvipgirls\.env') -Force
} else {
  Copy-Item (Join-Path $root 'sites\addisvipgirls\.env.server.example') (Join-Path $dest 'sites\addisvipgirls\.env') -Force
  Write-Warning 'No .env.server — packed .env from .env.server.example; edit paths on server.'
}

$readme = @"
After extract in cPanel File Manager (home folder, NOT astro docroot):

  addis-vip/
    astro/
    sites/addisvipgirls/.env

Full path should match ADDIS_SITE_DIR in .env (e.g. /home/addisvhi/addis-vip/...).

Next: cPanel → Setup Node.js App
  Application root: .../addis-vip/astro
  Startup file: scripts/rebuild-listener.mjs
  URL: build.addisvipgirls.com
  Env vars: see cpanel-node-environment.txt (edit paths; do not commit secrets)

Run NPM Install, Restart. Details: sites/addisvipgirls/DEPLOY-TESTING.md
"@
Set-Content -Path (Join-Path $dest 'README-CPANEL-EXTRACT.txt') -Value $readme -Encoding UTF8

if (Test-Path $outZip) { Remove-Item $outZip -Force }
Compress-Archive -Path (Join-Path $dest '*') -DestinationPath $outZip -CompressionLevel Optimal
Remove-Item $stage -Recurse -Force

$sizeMb = [math]::Round((Get-Item $outZip).Length / 1MB, 2)
Write-Host "Created: $outZip ($sizeMb MB)"
