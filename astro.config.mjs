import { defineConfig } from 'astro/config';

// Canlı alan adı: mujganthepub.com (GoDaddy, 2 Kasım 2026). Yayın: GitHub Pages (public/CNAME).
export default defineConfig({
  site: 'https://mujganthepub.com',
  // /menu ve /etkinlikler: GitHub Pages'te uzantısız adres için dizin/index.html üretimi
  build: { format: 'directory' },
  trailingSlash: 'ignore',
});
