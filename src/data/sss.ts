// Ana sayfadaki "Sık sorulanlar" ve FAQPage JSON-LD — aynı kaynak.
import { isletme } from './isletme';

export const sss = () => [
  { s: 'Müjgân Çayyolu nerede?',
    c: `Ankara Çayyolu'da, ${isletme.adres.mekan}'nin içindeyiz: ${isletme.adres.sokak.deger}, ${isletme.adres.ilce}. Google Haritalar'da “${isletme.haritaAdi}” olarak arayabilirsin.` },
  { s: 'Saat kaçta açıksınız?',
    c: `Haftanın her günü ${isletme.saatler.acik.deger} arası açığız. Mutfak açık olduğumuz her saat servis yapıyor.` },
  { s: 'Nasıl rezervasyon yapabilirim?',
    c: (isletme.whatsapp.deger ? 'WhatsApp hattımızdan yazman yeterli.' : `Instagram'dan @${isletme.instagram.kullanici} hesabımıza mesaj atman yeterli.`) +
       ' Kalabalık gruplar ve doğum günleri için önceden yazmanı öneririz.' },
  { s: 'Paket servisiniz var mı?',
    c: 'Evet, paket servisimiz var.' + (isletme.siparisPlatformlari.length ? ` Siparişi ${isletme.siparisPlatformlari.map((p) => p.ad).join(', ')} üzerinden verebilirsin.` : '') },
  { s: 'Karaoke ve canlı müzik ne zaman?',
    c: "Her perşembe 20.00'de Karaoke Gecesi var. Hafta sonu akşamları 20.00'de sahnede canlı müzik oluyor; güncel program Etkinlikler sayfasında." },
  { s: 'Social Hour nedir?', c: "Hafta içi her gün 18.00'e kadar tüm içeceklerde %20 indirim." },
];
