import type { APIRoute } from 'astro';
import { sitemapNames } from '../lib/sitemaps';

// Same URL and child names as the Rank Math sitemap on the live site, so Search Console keeps working.
export const GET: APIRoute = ({ site }) => {
  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNames()
  .map((n) => `  <sitemap><loc>${new URL(`/${n}-sitemap.xml`, site).href}</loc><lastmod>${now}</lastmod></sitemap>`)
  .join('\n')}
</sitemapindex>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
