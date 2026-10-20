# Allow inbound TCP on the Astro dev port (Private + Domain profiles).
param(
  [int]$Port = 4321
)

$ErrorActionPreference = 'Stop'
$ruleName = "Addis Astro dev TCP $Port"

$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName"
  exit 0
}

New-NetFirewallRule `
  -DisplayName $ruleName `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort $Port `
  -Profile Private, Domain | Out-Null

Write-Host "Added firewall rule: $ruleName (Private + Domain)"
Write-Host "Try http://<your-PC-LAN-IP>:$Port/ on your phone again."
