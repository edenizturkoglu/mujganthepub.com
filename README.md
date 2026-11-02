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

## İçerik ve CMS

- Tüm içerik `src/icerik/*.json` dosyalarında. Günlük güncellemeler için **https://mujganthepub.com/admin/** kullanılır.
- Giriş: e-posta ile sihirli bağlantı. Yalnızca yetkili adresler (Apps Script'teki `YETKILILER`) girer; kullanıcı GitHub görmez.
- CMS'te: önizlemede bir yazıya/görsele tıkla → düzenle; Menü, Etkinlikler, SEO, Sayfalar (yeni sayfa), İşletme (WhatsApp, saatler, paket servis) panelleri; **Yayınla** → 1–2 dk içinde sitede.
- CMS `main` dalına commit atar (yazar: giriş yapan e-posta): yerelde çalışmadan önce `git pull`.

### CMS sunucusu (bir kez)

Giriş e-postası ve GitHub erişimi Deniz'in Google hesabındaki küçük bir Apps Script uygulamasından geçer (`docs/cms-sunucu/Kod.gs`). GitHub anahtarı ve yetkili listesi yalnızca orada durur. Adım adım: **`docs/cms-sunucu/KURULUM.md`**. Çıkan `/exec` adresi `src/admin/ayar.ts` içindeki `VARSAYILAN`'a yazılır.
