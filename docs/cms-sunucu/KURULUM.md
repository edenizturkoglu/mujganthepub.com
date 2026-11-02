# CMS giriş sunucusu — kurulum (bir kez, ~10 dk)

CMS'e (https://mujganthepub.com/admin/) yalnızca yetkili e-postalar girer. Kişi e-postasını yazar, gelen bağlantıya tıklar, içeri girer. Kimse GitHub görmez.

Bunu küçük bir Google Apps Script uygulaması yapar (ücretsiz, Deniz'in Google hesabında çalışır):
- giriş bağlantısını Deniz'in Gmail'inden gönderir,
- GitHub anahtarını saklar ve CMS'in kaydetme isteklerini iletir; anahtar tarayıcıya ya da depoya hiç girmez.

## 1. GitHub anahtarı (yalnızca Deniz, bir kez)

GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token
- Token name: `mujgan-cms`
- Expiration: 1 yıl
- Repository access: **Only select repositories** → `mujganthepub.com`
- Permissions → Repository: **Contents: Read and write**, **Actions: Read** (Metadata kendiliğinden gelir)
- Generate → `github_pat_...` ile başlayan anahtarı kopyala.

## 2. Apps Script projesi

1. https://script.google.com → **Yeni proje**. Adı: `Müjgân CMS`.
2. `Kod.gs` içindekileri sil, bu klasördeki `Kod.gs` dosyasının tamamını yapıştır, kaydet.
3. Sol menü ⚙️ **Proje Ayarları** → en altta **Komut dosyası özellikleri** → Özellik ekle:

| Özellik | Değer |
|---|---|
| `GITHUB_TOKEN` | 1. adımdaki anahtar |
| `YETKILILER` | `btolgaselcuk@gmail.com,edenizturkoglu@gmail.com,ekinkaraibrahimoglu@gmail.com` |
| `SITE` | `https://mujganthepub.com` |

`GIZLI` ekleme; ilk çalışmada kendiliğinden oluşur.

## 3. İzinleri ver ve dene

1. Editöre dön, üstteki işlev listesinden **kurulumuDene** seç → **Çalıştır**.
2. Google izin ister (e-posta gönderme, dış bağlantı). "Bu uygulama doğrulanmadı" uyarısı çıkarsa: **Gelişmiş → Müjgân CMS'e git (güvenli değil) → İzin ver**. Uygulama senin; uyarı bu yüzden.
3. Yürütme günlüğünde şunlar görünmeli:
   - `Yetkililer: btolgaselcuk@gmail.com, ...`
   - `GitHub: 200 yazma izni: true`

`GitHub: 401` ya da `404` → anahtar yanlış ya da depo seçilmemiş.

## 4. Web uygulaması olarak yayınla

**Dağıt → Yeni dağıtım** → tür ⚙️ **Web uygulaması**
- Yürüten: **Ben**
- Erişimi olan: **Herkes** (Google hesabı olan herkes değil; düz "Herkes")
- Dağıt → **Web uygulaması URL'si**ni kopyala (`https://script.google.com/macros/s/.../exec`).

Bu URL'yi Claude'a gönder; CMS'e bağlanıp yayınlanır.

## Sonra

- **Kişi eklemek/çıkarmak:** Proje Ayarları → `YETKILILER` değerini düzenle. Çıkarılan kişinin açık oturumu da hemen kapanır. Yeniden dağıtım gerekmez.
- **Herkesin oturumunu kapatmak:** `GIZLI` özelliğini sil.
- **Anahtar süresi dolunca:** 1. adımı tekrarla, `GITHUB_TOKEN` değerini değiştir.
- **Kod.gs değişirse:** yapıştır → Dağıt → **Dağıtımları yönet** → kalem → Sürüm: **Yeni sürüm** → Dağıt. URL aynı kalır. (Yeni dağıtım açarsan URL değişir.)
- Bağlantı 15 dk geçerli ve tek kullanımlık; oturum 7 gün. Aynı adrese 60 sn'de bir bağlantı gider. Listede olmayan adrese e-posta gitmez, ekranda fark gösterilmez.
- Gmail'in günlük gönderim sınırı (kişisel hesap ~100) bu kullanım için fazlasıyla yeter.

## Güvenlik notları

- Sunucu GitHub'a yalnızca bu depoda içerik okuma, commit oluşturma ve `main`'i ileri alma isteklerini iletir; silme, ayar, erişim değiştirme yolları kapalıdır.
- Commit yazarı oturumdaki e-posta olur; kimin neyi değiştirdiği git geçmişinde görünür.
- Yetkili e-posta listesi ve anahtar herkese açık depoda değil, yalnızca Script Properties'te durur.
