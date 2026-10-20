import type { APIRoute } from 'astro';
import { brand } from '../brand';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = {
    name: brand.siteName,
    short_name: brand.siteName.replace(/\s+/g, ' ').slice(0, 30),
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0e0d',
    theme_color: brand.id === 'vip' ? '#d4a574' : '#6b8f71',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
