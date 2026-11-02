// Haftalık program ve tarihli etkinlikler.
// Kaynak: Tolga Selçuk, Müjgân WhatsApp grubu (26 Ekim – 1 Kasım 2026); afişler ajanstan (Ekin, Umut).
// Kampanya adları Umut'un 1 Kasım önerisi, Tolga onayladı ("tamam").
// Tarihli etkinlik geçince sayfada otomatik gizlenir; listeyi her hafta güncelle.

export type Gece = {
  id: string;
  /** JS getDay() değeri; 'wk' = hafta içi her gün */
  gun: string;
  gunAdi: string;
  kisa: string;
  baslik: string;
  saat?: string;
  metin: string;
  kampanya?: string;
  afis: string;
};

export const geceler: Gece[] = [
  { id: 'social-hour', gun: 'wk', gunAdi: 'Hafta içi her gün', kisa: 'Hafta içi', baslik: 'Social Hour', saat: "18.00'e kadar",
    metin: "Gün bitmeden masaya otur. İş çıkışının ilk turu Social Hour'da.", kampanya: 'Tüm içeceklerde %20 indirim', afis: '/posters/social-hour.jpg' },
  { id: 'chill-day', gun: '2', gunAdi: 'Her salı', kisa: 'Salı', baslik: 'Chill Day',
    metin: 'Haftanın sakin akşamı: şarap, paylaşmalık tabaklar, uzun muhabbet.', kampanya: 'Tüm şişe şaraplarda %20 indirim', afis: '/posters/chill-day.jpg' },
  { id: 'shake-brake', gun: '3', gunAdi: 'Her çarşamba', kisa: 'Çarşamba', baslik: 'Shake Brake',
    metin: "Bar ekibinin günü: sour'lar, ferahlar, imza kokteyller.", kampanya: 'Tüm kokteyllerde %20 indirim', afis: '/posters/shake-brake.jpg' },
  { id: 'karaoke', gun: '4', gunAdi: 'Her perşembe', kisa: 'Perşembe', baslik: 'Karaoke Gecesi', saat: "20.00'de başlıyor",
    metin: 'Ekibini topla, şarkını seç, birlikte söyle. Sahne senin.', afis: '/posters/karaoke.jpg' },
];

export type Etkinlik = { tarih: string; saat: string; baslik: string; tur: string; not?: string };

export const etkinlikler: Etkinlik[] = [
  { tarih: '2026-11-06', saat: '20:00', baslik: 'Flying Fox', tur: 'Canlı müzik', not: 'tarih Tolga ile teyit edilecek' },
  { tarih: '2026-11-07', saat: '20:00', baslik: 'Gizem Selçuk Quartet', tur: 'Caz' },
];

/** "Bugün" kutusu için, JS getDay() sırasıyla (0 = pazar) */
export const hafta = [
  { ad: 'Pazar' },
  { ad: 'Pazartesi' },
  { ad: 'Salı', baslik: 'Chill Day', kisa: 'Tüm şişe şaraplarda %20 indirim.' },
  { ad: 'Çarşamba', baslik: 'Shake Brake', kisa: 'Tüm kokteyllerde %20 indirim.' },
  { ad: 'Perşembe', baslik: 'Karaoke Gecesi', saat: '20.00', kisa: 'Ekibini topla, şarkını seç.' },
  { ad: 'Cuma' },
  { ad: 'Cumartesi', baslik: 'Canlı caz', saat: '20.00', kisa: "ODTÜ Caz'dan tanıdık bir ekip sahnede." },
];

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const tarihParcala = (iso: string) => {
  const d = new Date(iso + 'T12:00:00');
  return { gun: d.getDate(), ay: AYLAR[d.getMonth()], haftaGunu: GUNLER[d.getDay()] };
};
