# Müjgan Web

Müjgan (Beysupark, Çayyolu) web sitesi. Bağlam için `CLAUDE.md`, brif için `docs/site-brifi.md`.

## Çalıştırma

Node, nvm ile `~/.nvm` altına kuruldu (kabuk profili değiştirilmedi). Yeni terminalde önce:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
```

- `npm run dev` — geliştirme sunucusu (http://localhost:4321)
- `npm run build` — `dist/` içine statik site

## Nerede ne var

- `src/data/isletme.ts` — adres, telefon, saatler, sipariş platformları, etkinlikler. Eksik alan `null` kalır, sitede `[DOLDURULACAK: ...]` görünür; `dogrulandi: false` olan alan JSON-LD'ye girmez.
- `src/data/menu.ts` — menü kategorileri ve kalemleri.
- `src/pages/` — `index` (tek sayfa), `menu` (QR hedefi), `kvkk`.
