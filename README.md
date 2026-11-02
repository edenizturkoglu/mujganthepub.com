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

- Tüm içerik `src/icerik/*.json` dosyalarında. Günlük güncellemeler için **https://mujganthepub.com/admin/** kullanılır (şifreli).
- CMS'te: önizlemede bir yazıya/görsele tıkla → düzenle; Menü, Etkinlikler, SEO, Sayfalar (yeni sayfa), İşletme (WhatsApp, saatler, paket servis) panelleri; **Yayınla** → 1–2 dk içinde sitede.
- CMS `main` dalına commit atar: yerelde çalışmadan önce `git pull`.

### CMS ilk kurulum (bir kez)

1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token.
   - Repository access: *Only select repositories* → `mujganthepub.com`
   - Permissions: **Contents: Read and write**, **Actions: Read** (Metadata otomatik)
   - Süre: 1 yıl (dolunca CMS Ayarlar'dan yenisi girilir)
2. https://mujganthepub.com/admin/ → anahtarı yapıştır, en az 12 karakterlik bir şifre belirle.
3. Şifreli anahtar `public/admin/kasa.json` olarak depoya yazılır; sonraki girişlerde yalnızca şifre sorulur.
