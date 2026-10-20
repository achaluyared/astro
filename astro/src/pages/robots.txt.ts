import type { APIRoute } from 'astro';

// Replaces the stale physical robots.txt (wrong sitemap URL, Crawl-delay: 20, legacy /plugins/ paths).
export const GET: APIRoute = ({ site }) =>
  new Response(
    ['User-agent: *', 'Allow: /', 'Disallow: /search/', '', `Sitemap: ${new URL('/sitemap_index.xml', site).href}`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
