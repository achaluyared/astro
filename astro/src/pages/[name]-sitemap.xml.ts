import type { APIRoute, GetStaticPaths } from 'astro';
import { sitemapNames, sitemapUrls } from '../lib/sitemaps';

export const getStaticPaths: GetStaticPaths = () => sitemapNames().map((name) => ({ params: { name } }));

export const GET: APIRoute = ({ params, site }) => {
  const urls = sitemapUrls(params.name!);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${new URL(u.path, site).href}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
