import { isletme } from '../data/isletme';
export const GET = () => {
  const bugun = new Date().toISOString().slice(0, 10);
  const urls = ['', 'menu', 'etkinlikler'].map((y) => `  <url><loc>${isletme.site}/${y}</loc><lastmod>${bugun}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } });
};
