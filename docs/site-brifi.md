# Müjgan Web Sitesi — Brif (taslak)

**Durum:** Deniz'in incelemesi için ilk brif, 15 Ekim 2026. Onaylanmış site planı değildir.

## 1. Amaç

Müjgan'ın Beysupark'a taşındığını duyurmak ve ziyaretçiyi üç eyleme götürmek: **rezervasyon / iletişim**, **yol tarifi**, **paket sipariş**. Site; Google İşletme Profili, Instagram bio'su ve masa/menü QR'larının ortak varış noktası olacak.

## 2. Kimler gelecek, ne arayacak

| Ziyaretçi | Aradığı | Site karşılığı |
|---|---|---|
| Yakın çevrede yaşayan / çalışan | Ne servis ediliyor, fiyat, saat | Menü, saatler, öğle/akşam ayrımı |
| Spor salonu kitlesi (öğle) | Hafif/sağlıklı seçenek, hızlı servis, gel-al | Menüde işaretli seçenekler (doğrulanmış içerik bilgisiyle) |
| Eski Müjgan müşterisi | Nereye taşındı, ne değişti | Kısa taşınma hikâyesi |
| Akşam / küçük grup | Etkinlik programı, rezervasyon | Etkinlikler + rezervasyon |
| Grup / şirket | Özel organizasyon | Grup talebi formu veya iletişim |
| Paket sipariş | Hangi platform | Platform bağlantıları (seçilince) |

## 3. Önerilen sayfa yapısı (öneri)

Tek sayfa + menü için ayrı sayfa (QR doğrudan menüye açılsın):

1. **Kahraman alanı** — Müjgan, Beysupark/Çayyolu, kısa tanım, 3 buton: Rezervasyon · Yol tarifi · Paket sipariş
2. **Taşındık** — 100. Yıl'dan Beysupark'a; korunan / eklenen
3. **Öğle & akşam** — iki servis farkı, saatler
4. **Menü** — `/menu` sayfasına bağlantı; öne çıkan birkaç yemek (gerçek fotoğrafla)
5. **Etkinlikler** — yaklaşan program (yoksa "yakında" değil, gizle)
6. **Grup & özel organizasyon** — kısa açıklama + iletişim
7. **Ulaşım** — harita, giriş tarifi, otopark (doğrulandıktan sonra)
8. **Alt bilgi** — adres, telefon, saatler, Instagram, KVKK bağlantısı

`/menu`: kategori bazlı, mobilde hızlı, fiyatlı. Kokteyl/şarap bölümleri sade liste; promosyon dili yok.

## 4. İçerik envanteri

| İçerik | Durum | Kimden |
|---|---|---|
| Logo (vektör) | Yok | Tolga |
| Renk/tipografi | Yok — mevcut kimlik mi, yenileme mi? | Deniz/Tolga |
| Gerçek fotoğraflar (mekân, yemek, ekip) | Çekim konuşuluyor | Tolga / fotoğrafçı |
| Menü kalemleri + fiyatlar | Yok | İşletme |
| Sağlıklı seçeneklerin içerik bilgisi | Yok | Şef |
| Resmî adres, telefon, WhatsApp | Adres kısmi | İşletme |
| Çalışma saatleri (öğle/akşam, mutfak kapanış) | Yok | İşletme |
| Rezervasyon yöntemi | Belli değil | İşletme |
| Paket servis platformları | Belli değil | İşletme |
| Etkinlik programı | Belli değil | İşletme |
| Taşınma hikâyesi metni | Yazılacak | Deniz/Claude taslak |
| KVKK aydınlatma metni | Yok | Hukuk kontrolü |

## 5. SEO ve ölçüm

- Başlık/açıklama: "Müjgan — Beysupark, Çayyolu" ekseninde; aranacak niyetler (Çayyolu restoran, Beysupark, canlı müzik vb.) yayın öncesi kontrol edilecek.
- `Restaurant` JSON-LD: ad, adres, saatler, menü URL, `servesCuisine`, rezervasyon kabulü — yalnızca doğrulanmış alanlarla.
- Ad/adres/telefon Google İşletme Profili ile birebir aynı.
- Olaylar: `rezervasyon_tikla`, `telefon_tikla`, `whatsapp_tikla`, `yol_tarifi_tikla`, `siparis_platform_tikla`, `menu_goruntule`, `grup_formu_gonder`. Ölçüm aracı seçimi açık.

## 6. Teknik seçenekler (karar Deniz'de)

| Seçenek | Artı | Eksi |
|---|---|---|
| **A. Statik site (Astro veya sade HTML/CSS) + ücretsiz barındırma** (Cloudflare Pages / Netlify / Vercel) | Çok hızlı, ucuz, Claude Code ile tam kontrol, menü bir veri dosyasından üretilir | Menü güncellemesi için sen veya Claude gerekir (ya da basit bir CMS eklenir) |
| B. Statik site + başsız CMS / Google Sheets'ten menü | İşletme menüyü kendisi günceller | Kurulum biraz daha uzun |
| C. Hazır site kurucu (Wix, Squarespace vb.) | İşletme kendi düzenler | Aylık ücret, daha az kontrol, Claude Code'un rolü küçülür |

Öneri: **A ile başla, menüyü ayrı veri dosyasında tut**; işletme kendi güncellemek isterse B'ye geçiş kolay olur. Alan adı ve barındırma maliyeti Deniz'in emeğinden ayrı gösterilecek.

## 7. Aşamalar

1. Brif ve yığın kararı
2. Tasarım yönü (1–2 görsel öneri) — gerçek fotoğraf ve logo gelince
3. İskelet + yer tutuculu içerik
4. Gerçek içerik, menü, ölçüm, schema
5. Önizleme → Tolga onayı → alan adı/yayın (Deniz'in onayıyla)
