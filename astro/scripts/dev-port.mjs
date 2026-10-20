/** Local dev/preview ports — one brand per port when both run on the same PC. */
import { readFileSync } from 'node:fs';

export const DEV_PORT_MASSAGE = 5432;
export const DEV_PORT_VIP = 4321;

export function devPortForBrand(brand) {
  return (brand || 'massage').toLowerCase() === 'vip' ? DEV_PORT_VIP : DEV_PORT_MASSAGE;
}

export function devPortFromEnv() {
  return devPortForBrand(process.env.BRAND);
}

/** Read BRAND= from a site .env before Node --env-file applies (run-dev). */
export function readBrandFromEnvFile(envFile) {
  try {
    const text = readFileSync(envFile, 'utf8');
    const m = text.match(/^BRAND\s*=\s*(\S+)/m);
    if (m) return m[1].trim();
  } catch {
    /* ignore */
  }
  return 'massage';
}
