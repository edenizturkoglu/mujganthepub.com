# Müjgan — Web Sitesi Projesi

Bu klasör, Müjgan restoran-barının yeni web sitesi için Claude Code çalışma alanıdır.
Proje sahibi: E. Deniz Türkoğlu (Fractional CMO, D BLOK). Müşteri tarafı muhatap: Tolga Selçuk.
Tam iş bağlamı claude.ai'deki **"Müjgan"** projesinde `Mujgan-Claude-Devir.md` dosyasındadır; burada yalnızca site için gereken kısım özetlenmiştir.

## Çalışma kuralları

- Dil: kısa, doğal Türkçe. Site içeriği Türkçe (ikinci dil kararı yok).
- **Doğrulanmış bilgi, Deniz'in kararı, görüşme notu ve öneri ayrı tutulur.** Bilinmeyen bilgiyi (saat, telefon, fiyat, menü kalemi, açılış tarihi) uydurma; `[DOLDURULACAK: ...]` yer tutucusu kullan ve `docs/acik-sorular.md` listesine ekle.
- Soruları dolaylı değil doğrudan sor.
- Yayına alma, alan adı satın alma, DNS, hesap/harita (Google İşletme Profili) değişikliği ve ücretli servis açma Deniz'in açık onayı olmadan yapılmaz.
- Commit'ler küçük ve açıklamalı olsun; başka oturumun değişikliklerini ezme.

## İşletme — site için geçerli bilgiler

| Konu | Durum |
|---|---|
| Ad | **Müjgan** (karar). Classic ile ortaklık yok; Classic adı, yorumları, takipçileri, fotoğrafları sitede kullanılmaz. |
| Eski yer | Ankara 100. Yıl — ODTÜ öğrencisi ağırlıklı pub (taşınma hikâyesinde geçebilir) |
| Yeni yer | Beysupark AVM, Çayyolu. Adres (Tolga, 28 Ekim 2026): Çayyolu Mah. S. Saltoğlu Blv. No: 209/16, 06810 Çankaya/Ankara. Google Haritalar'da "Müjgân Çayyolu". Giriş/otopark tarifi bekleniyor. |
| Hizmet | Öğle ve akşam yemeği, küçük sahnede etkinlikler, paket servis (kendi kuryesi yok; platform henüz belli değil) |
| Menü | 34 yemek, fiyatlı (Tolga, menü.xlsx, 31 Ekim 2026) → `src/icerik/menu.json`. İçecek/kokteyl menüsü henüz yok. |
| Saatler | Her gün 10.30–01.00; mutfak açık olduğu her saat (Deniz, 2 Kasım 2026) |
| Rezervasyon | WhatsApp 0536 049 96 99 (Deniz, 2 Kasım 2026). Düğmeler WhatsApp yeşili + resmî glif (`src/components/RezButon.astro`). Telefon da aynı numara (Deniz, 2 Kasım 2026). |
| Program | Hafta içi Social Hour (18.00'e kadar), salı Chill Day, çarşamba Shake Brake, perşembe Karaoke 20.00, hafta sonu canlı müzik 20.00 → `src/icerik/etkinlikler.json` |
| Kapasite | Mekân ~300 kişi; küçük sahne 25–30 oturmalı / 50–60 ayakta |
| Kitle | Çalışan genç ve orta yaş. Kesin yaş aralığı, brunch veya öğrencileri dışlama kararı **yok** — sitede bu yönde ifade kullanma. |
| Fiyat konumu | Pinkel'in "bir tık altında" (görüşme notu; ürün fiyatı yok) |
| Ulaşım | Arabalı müşteri bekleniyor; otopark sorunu olmadığı aktarıldı (doğrulanmadı). Polis çevirmesiyle ilgili görüşme notu **asla** içerikte kullanılmaz. |
| Açılış | 23 Ekim 2026 (Drive klasörü "23 Ekim Açılış") |
| Instagram | @mujganthepub (ad korunuyor). Eski referans: @mujgan100yil. |

## Sitenin işi

Teklif kapsamındaki tanım: **"Mobil uyumlu menü, mekân, ulaşım, çalışma saatleri, etkinlik ve rezervasyon bilgileri."**
Ziyaretçinin 3 işi: (1) burası ne, bana uyar mı → (2) menü/fiyat → (3) nasıl gelirim / rezervasyon / sipariş.
Ayrıntılı brif: `docs/site-brifi.md`. Açık sorular: `docs/acik-sorular.md`.

## Kırmızı çizgiler

- **Alkol:** Türkiye'de alkollü içki reklam/tanıtım mevzuatı var (TADAB). Kokteyl/şarap/viski ürün bilgisi menüde listelenebilir; özendirici dil kullanma. **2 Kasım 2026 itibarıyla sitede ajansın kampanya afişleri ve indirim metinleri (Social Hour, Chill Day, Shake Brake) yayında — Deniz afişleri site için gönderdi; mevzuat onayı Tolga'dan bekleniyor (docs/acik-sorular.md).** Yeni alkol promosyonu ekleme.
- **Sağlık iddiası yok:** "Sağlıklı" seçeneklerde kalori/protein gibi değerler yalnızca işletmenin doğruladığı veriyle yazılır.
- **Sosyal kanıt:** Yalnızca Müjgan'ın kendi, izinli yorumları. Classic veya eski adres yorumları "yeni mekân yorumu" gibi sunulmaz.
- **Kişisel veri (KVKK):** Rezervasyon/iletişim formu kişisel veri topluyorsa aydınlatma metni ve izinler hukuki kontrol olmadan canlıya alınmaz. Pazarlama izni rezervasyon izninden ayrı.
- Stok fotoğrafı gerçek mekân/yemek gibi gösterme; gerçek çekim gelene kadar yer tutucu kullan.

## Teknik

- Yığın: **Astro 7, statik**. Sayfalar: `/` (ana), `/menu/`, `/etkinlikler/`, `/kvkk/` (linksiz, noindex), `/<slug>/` (CMS'ten oluşturulan sayfalar), `/admin/` (CMS).
- **İçerik `src/icerik/*.json` dosyalarındadır** (metinler, görseller, menü, etkinlikler, SEO, işletme bilgileri, özel sayfalar `sayfalar/*.json`). Şablonlar yalnızca buradan okur (`src/lib/icerik.ts`; `src/data/*.ts` bu dosyaları sarar). Metin/görsel eklerken şablonda `cms('dosya:json.yolu')` özniteliği ver ki CMS'te tıklanıp düzenlenebilsin.
- **CMS (`/admin/`, kod `src/admin/`)**: e-posta ile sihirli bağlantı girişi (Tolga, Deniz, Ekin). Arka uç Deniz'in Google hesabında Apps Script (`docs/cms-sunucu/Kod.gs`, kurulum `KURULUM.md`): bağlantı e-postası, imzalı oturum, GitHub vekili (anahtar ve yetkili listesi Script Properties'te; tarayıcıya/depoya girmez). Adres `src/admin/ayar.ts`. Önizlemede öğeye tıkla-düzenle; Menü, Etkinlikler, SEO, Sayfalar, İşletme panelleri. "Yayınla" → GitHub API ile tek commit → Actions yayınlar.
- **CMS doğrudan `main`'e commit atar.** Bu klasörde çalışmaya başlamadan önce mutlaka `git pull` yap; içerik değişikliği için JSON dosyalarını düzenle, şablonlara metin gömme.
- Tasarım: koyu şişe yeşili zemin, logo altını, krem "kâğıt" menü; yazı tipleri Young Serif + Figtree, `public/fonts/` altından (Google'a istek yok). Stil: `src/styles/global.css`.
- Fotoğraflar `public/img/` (Drive: "23 Ekim Açılış/Fotolar" ve fotoğrafçı klasörü, 1100px'e küçültülmüş), afişler `public/posters/`, CMS yüklemeleri `public/img/yukleme/` (1600px, JPEG). Boyutlar görsel nesnesindeki `w`/`h` ya da `src/data/gorseller.json`.
- Yayın: **GitHub Pages**, alan adı `mujganthepub.com` (GoDaddy DNS → GitHub Pages IP'leri). `main`'e push → `.github/workflows/yayin.yml` derleyip yayınlar; her pazartesi otomatik yeniden derlenir (etkinlik şeması tazelenir).
- `isletme.yayinda = true`: yer tutucular (`Bekliyor`) canlıda görünmez, eksik alanlar gizlenir. Taslak bakmak için geçici olarak `false` yap.
- SEO: sayfa başına başlık/açıklama/canonical, JSON-LD (`src/lib/sema.ts`: BarOrPub+Restaurant, WebSite, FAQPage, Menu, MusicEvent/Event, BreadcrumbList), `sitemap.xml`, `robots.txt`.
- Hedefler: hızlı mobil yükleme, yerel SEO (Restaurant schema / JSON-LD, tutarlı ad-adres-telefon), Google İşletme Profili ve Instagram'dan tek tık erişim, QR menü bağlantısı, ölçüm (rezervasyon/arama/yol tarifi/sipariş tıklamaları ayrı olay olarak).
- Tıklama ölçümü gerçekleşmiş ziyaret sayılmaz; raporlarda öyle yazılmaz.
