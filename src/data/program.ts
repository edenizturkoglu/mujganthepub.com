// Etkinlikler — kaynak: src/icerik/etkinlikler.json (CMS: Etkinlikler paneli).
// Tarihli etkinlik geçince sayfada otomatik gizlenir.
import { etkinlikIcerik } from '../lib/icerik';
export const geceler = etkinlikIcerik.geceler;
export const etkinlikler = [...etkinlikIcerik.etkinlikler].sort((a, b) => (a.tarih + a.saat).localeCompare(b.tarih + b.saat));
export const hafta = etkinlikIcerik.bugun;

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
export const tarihParcala = (iso: string) => {
  const d = new Date(iso + 'T12:00:00');
  return { gun: d.getDate(), ay: AYLAR[d.getMonth()], haftaGunu: GUNLER[d.getDay()] };
};
