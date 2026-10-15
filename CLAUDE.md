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
| Yeni yer | Beysupark AVM, Çayyolu. Kullanıcının verdiği adres: S. Saltoğlu Blv. No:209/36, 06810 Çankaya/Ankara. **Resmî adres, harita pini ve gerçek giriş henüz kesinleşmedi.** |
| Hizmet | Öğle ve akşam yemeği, küçük sahnede etkinlikler, paket servis (kendi kuryesi yok; platform henüz belli değil) |
| Menü | ~30 yemek + 10 alkollü kokteyl; şarap menüsü, sıcak şarap, şarap tabağı, single malt. Öğlen spor salonu kitlesine sağlıklı seçenekler. Kalemler/fiyatlar **henüz yok**. |
| Kapasite | Mekân ~300 kişi; küçük sahne 25–30 oturmalı / 50–60 ayakta |
| Kitle | Çalışan genç ve orta yaş. Kesin yaş aralığı, brunch veya öğrencileri dışlama kararı **yok** — sitede bu yönde ifade kullanma. |
| Fiyat konumu | Pinkel'in "bir tık altında" (görüşme notu; ürün fiyatı yok) |
| Ulaşım | Arabalı müşteri bekleniyor; otopark sorunu olmadığı aktarıldı (doğrulanmadı). Polis çevirmesiyle ilgili görüşme notu **asla** içerikte kullanılmaz. |
| Açılış | Ekim 2026 ikinci yarısı hedefleniyordu; kesin tarih doğrulanmadı. |
| Instagram | @mujganthepub (ad korunuyor). Eski referans: @mujgan100yil. |

## Sitenin işi

Teklif kapsamındaki tanım: **"Mobil uyumlu menü, mekân, ulaşım, çalışma saatleri, etkinlik ve rezervasyon bilgileri."**
Ziyaretçinin 3 işi: (1) burası ne, bana uyar mı → (2) menü/fiyat → (3) nasıl gelirim / rezervasyon / sipariş.
Ayrıntılı brif: `docs/site-brifi.md`. Açık sorular: `docs/acik-sorular.md`.

## Kırmızı çizgiler

- **Alkol:** Türkiye'de alkollü içki reklam/tanıtım mevzuatı var (TADAB). Kokteyl/şarap/viski ürün bilgisi menüde listelenebilir; ama ana sayfa kahramanında alkol öne çıkarma, indirim, "happy hour", promosyon, özendirici dil kullanma. Yayın öncesi güncel mevzuat kontrol edilecek.
- **Sağlık iddiası yok:** "Sağlıklı" seçeneklerde kalori/protein gibi değerler yalnızca işletmenin doğruladığı veriyle yazılır.
- **Sosyal kanıt:** Yalnızca Müjgan'ın kendi, izinli yorumları. Classic veya eski adres yorumları "yeni mekân yorumu" gibi sunulmaz.
- **Kişisel veri (KVKK):** Rezervasyon/iletişim formu kişisel veri topluyorsa aydınlatma metni ve izinler hukuki kontrol olmadan canlıya alınmaz. Pazarlama izni rezervasyon izninden ayrı.
- Stok fotoğrafı gerçek mekân/yemek gibi gösterme; gerçek çekim gelene kadar yer tutucu kullan.

## Teknik

- Yığın (stack) **henüz seçilmedi** — bkz. `docs/site-brifi.md` §6. Karar verilmeden iskelet kurma.
- Hedefler: hızlı mobil yükleme, yerel SEO (Restaurant schema / JSON-LD, tutarlı ad-adres-telefon), Google İşletme Profili ve Instagram'dan tek tık erişim, QR menü bağlantısı, ölçüm (rezervasyon/arama/yol tarifi/sipariş tıklamaları ayrı olay olarak).
- Tıklama ölçümü gerçekleşmiş ziyaret sayılmaz; raporlarda öyle yazılmaz.
