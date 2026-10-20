/**
 * Print LAN URLs for phone/tablet testing on the same Wi‑Fi.
 */
import { networkInterfaces } from 'node:os';

/** @returns {string[]} non-internal IPv4 addresses */
export function lanIpv4Addresses() {
  const out = [];
  for (const ifaces of Object.values(networkInterfaces())) {
    if (!ifaces) continue;
    for (const i of ifaces) {
      if (i.family !== 'IPv4' || i.internal) continue;
      out.push(i.address);
    }
  }
  return out;
}

export function printDevLanUrls(port) {
  const ips = lanIpv4Addresses();
  console.log('\n--- Dev on this PC ---');
  console.log(`  http://127.0.0.1:${port}/`);
  if (!ips.length) {
    console.log('\n(No LAN IPv4 found — Wi‑Fi off or no adapter?)');
    return;
  }
  console.log('\n--- Same Wi‑Fi (phone / tablet) ---');
  for (const ip of ips) console.log(`  http://${ip}:${port}/`);
  console.log(
    '\nIf the phone cannot connect: allow Node through Windows Firewall (Private network),\n' +
      '  or run once as Administrator:\n' +
      `    powershell -ExecutionPolicy Bypass -File scripts/open-dev-firewall.ps1 -Port ${port}\n` +
      'Also check: phone on Wi‑Fi (not mobile data), no guest-network isolation, PC IP unchanged.',
  );
}

const invoked = process.argv[1]?.replace(/\\/g, '/');
if (invoked?.endsWith('dev-lan-info.mjs')) {
  printDevLanUrls(Number(process.argv[2] || 4321));
}
