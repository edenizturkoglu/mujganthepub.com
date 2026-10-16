# Açık Sorular — Web Sitesi

Yanıt geldikçe işaretle ve yanına tarih + kaynak yaz.

## Deniz'in kararı

- [x] Teknik yığın: **A — Astro statik**, menü `src/data/menu.ts` dosyasında (15 Ekim 2026, Deniz)
- [x] Görsel yön: logo/fotoğraf gelene kadar geçici nötr tasarım (15 Ekim 2026, Deniz)
- [ ] Alan adı: hangisi, kimin adına, kim satın alacak?
- [ ] Görsel kimlik: mevcut Müjgan kimliği mi kullanılacak, yenilenecek mi?
- [ ] Site sadece Türkçe mi?

## İşletmeden (Tolga)

- [ ] Kesin açılış tarihi; açıldıysa hangi gün?
- [ ] Resmî adres, birim no, müşterinin kullanacağı giriş ve harita pini
- [ ] Telefon / WhatsApp numarası
- [ ] Çalışma saatleri: öğle, akşam, mutfak kapanış, kapalı gün
- [ ] Menü kalemleri ve fiyatlar; hangileri sağlıklı/öğle seçeneği; içerik bilgileri
- [ ] Rezervasyon nasıl alınacak (telefon, WhatsApp, form, rezervasyon sistemi)?
- [ ] Paket servis hangi platformlarda, hangi saatlerde; gel-al var mı?
- [ ] Etkinlik programı var mı; nasıl duyurulacak?
- [ ] Logo dosyası ve gerçek fotoğraflar ne zaman gelir?
- [ ] Otopark ve AVM giriş/çıkış saatleri
- [ ] Grup/özel organizasyon talepleri kime gidecek?
- [ ] Öğle servisinde gel-al var mı?
- [ ] Alerjen bilgilendirme metni (menü sayfası altı)
- [ ] Taşınma hikâyesi taslağı onayı: korunanlar / yenilikler neler?

## Yayın öncesi kontrol

- [ ] Sitede `[DOLDURULACAK` kalmadı (`grep -r DOLDURULACAK dist/`)
- [ ] `src/data/isletme.ts` → `yayinda: true` (şu an noindex)
- [ ] Alan adı seçilince `astro.config.mjs` içine `site` eklenecek
- [ ] Ölçüm aracı seçimi (olaylar şimdilik `dataLayer`'a yazılıyor)
