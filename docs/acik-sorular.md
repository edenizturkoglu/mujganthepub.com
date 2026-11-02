# Açık Sorular — Web Sitesi

Yanıt geldikçe işaretle ve yanına tarih + kaynak yaz.

## Deniz'in kararı

- [x] Teknik yığın: **A — Astro statik**, menü `src/data/menu.ts` dosyasında (15 Ekim 2026, Deniz)
- [x] Görsel yön: logo/fotoğraf gelene kadar geçici nötr tasarım (15 Ekim 2026, Deniz)
- [x] Alan adı: mujganthepub.com (GoDaddy'de kayıtlı; 2 Kasım 2026)
- [x] Görsel kimlik: mevcut logo (müjgan 2027.pdf) + ajansın renk paleti (yeşil, altın, kraft, krem, bordo, turuncu)
- [ ] Site sadece Türkçe mi?

## İşletmeden (Tolga)

- [x] Açılış: 23 Ekim 2026
- [x] Adres: Çayyolu Mah. S. Saltoğlu Blv. No: 209/16, Beysupark AVM (Tolga, 28 Ekim) — Google'daki kayıtla birebir aynı mı kontrol et
- [ ] Müşterinin kullanacağı giriş (AVM içi tarif)
- [x] WhatsApp: 0536 049 96 99 (Deniz, 2 Kasım) — rezervasyon düğmeleri WhatsApp'a gidiyor
- [ ] Aranacak telefon numarası (sitede "Telefon" satırı ve Google yapısal verisi için) — WhatsApp numarasıyla aynı mı?
- [x] Saatler: her gün 10.30–01.00, mutfak hep açık (Deniz, 2 Kasım) — pazar dahil mi teyit
- [x] Menü kalemleri ve fiyatlar (menü.xlsx, 31 Ekim)
- [ ] İçecek / kokteyl menüsü sitede olacak mı?
- [ ] "Cesar Protein Plate" yazımı (Caesar?)
- [x] Rezervasyon: WhatsApp
- [ ] Paket servis hangi platformlarda, hangi saatlerde; gel-al var mı?
- [x] Haftalık program (src/data/program.ts)
- [ ] Cuma canlı müzik her hafta mı? Cumartesi caz düzenli mi? Flying Fox tarihi (6 Kasım?)
- [ ] Kampanya indirim metinleri sitede kalsın mı (alkol mevzuatı) — Tolga onayı
- [ ] "Shake Brake" yazımı bilinçli mi?
- [x] Logo ve fotoğraflar geldi (Drive)
- [ ] Otopark ve AVM giriş/çıkış saatleri
- [ ] Grup/özel organizasyon talepleri kime gidecek?
- [ ] Öğle servisinde gel-al var mı?
- [ ] Alerjen bilgilendirme metni (menü sayfası altı)
- [ ] Taşınma hikâyesi taslağı onayı: korunanlar / yenilikler neler?

## Yayın öncesi kontrol

- [ ] Sitede `[DOLDURULACAK` kalmadı (`grep -r DOLDURULACAK dist/`)
- [x] `src/data/isletme.ts` → `yayinda: true` (2 Kasım 2026)
- [x] `astro.config.mjs` → `site: https://mujganthepub.com`
- [ ] Ölçüm aracı seçimi (olaylar şimdilik `dataLayer`'a yazılıyor)

## Yayın (2 Kasım 2026)

- [ ] GitHub'da `mujganthepub.com` deposu (Deniz açacak) → kod push, Pages: GitHub Actions
- [ ] GoDaddy DNS: A @ → 185.199.108.153 / .109.153 / .110.153 / .111.153; CNAME www → edenizturkoglu.github.io
- [ ] HTTPS zorunlu (Pages ayarı, DNS yayıldıktan sonra)
- [ ] Search Console doğrulaması + sitemap gönderimi
- [ ] Google İşletme Profili: web sitesi, menü, rezervasyon linki, saatler
- [ ] Instagram bio linki
