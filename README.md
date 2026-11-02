# Müjgân Web

Müjgân Çayyolu (Beysupark AVM) web sitesi — canlı adres: https://mujganthepub.com
Bağlam için `CLAUDE.md`, brif için `docs/site-brifi.md`, bekleyenler için `docs/acik-sorular.md`.

## Çalıştırma

Node, nvm ile `~/.nvm` altına kuruldu (kabuk profili değiştirilmedi). Yeni terminalde önce:

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
```

- `npm run dev` — geliştirme sunucusu (http://localhost:4321)
- `npm run build` — `dist/` içine statik site

## Yayın

`main` dalına push edince GitHub Actions siteyi derler ve GitHub Pages'e yayınlar (`.github/workflows/yayin.yml`). Alan adı `public/CNAME`.

## Sık güncellenenler

- `src/data/isletme.ts` — telefon, WhatsApp (gelince `whatsapp.deger`), paket servis linkleri (`siparisPlatformlari`), giriş tarifi.
- `src/data/program.ts` — tarihli etkinlikler (her hafta) ve haftalık geceler.
- `src/data/menu.ts` — menü ve fiyatlar.
