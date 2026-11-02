import { isletme, seo, ozelSayfalar } from '../lib/icerik';
export const GET = () => {
  const bugun = new Date().toISOString().slice(0, 10);
  const yollar = ['/', '/menu/', '/etkinlikler/'].filter((y) => seo[y]?.indeksle !== false)
    .concat(ozelSayfalar.filter((p) => p.seo?.indeksle !== false).map((p) => `/${p.slug}/`));
  const urls = yollar.map((y) => `  <url><loc>${isletme.site}${y}</loc><lastmod>${bugun}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } });
};
