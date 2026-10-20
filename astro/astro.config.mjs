// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { resolve } from 'node:path';
import { devPortForBrand } from './scripts/dev-port.mjs';
import { lanIpv4Addresses } from './scripts/dev-lan-info.mjs';

const brand = (process.env.BRAND || 'massage').toLowerCase() === 'vip' ? 'vip' : 'massage';
const siteDir = process.env.ADDIS_SITE_DIR?.trim();
const outDir = siteDir ? resolve(siteDir, 'dist') : './dist';

// https://astro.build/config
const devPort = devPortForBrand(brand);
/** HMR from phones must not use localhost (override with DEV_LAN_HOST in .env). */
const devLanHost = process.env.DEV_LAN_HOST?.trim() || lanIpv4Addresses()[0];

export default defineConfig({
  site: process.env.SITE_URL || (brand === 'vip' ? 'https://addisvipgirls.com' : 'https://massageinaddisababa.com'),
  server: { port: devPort, host: true, strictPort: true, allowedHosts: true },
  preview: { port: devPort, host: true, strictPort: true, allowedHosts: true },
  devToolbar: { enabled: false },
  trailingSlash: 'always',
  outDir,
  build: { format: 'directory' },
  vite: {
    server: devLanHost
      ? {
          hmr: {
            host: devLanHost,
            port: devPort,
            clientPort: devPort,
          },
        }
      : undefined,
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.BRAND': JSON.stringify(brand),
    },
    optimizeDeps: {
      include: ['glightbox'],
    },
    ssr: {
      noExternal: ['glightbox'],
    },
  },
});
