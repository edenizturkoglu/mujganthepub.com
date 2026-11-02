// İşletme bilgileri — kaynak: src/icerik/isletme.json (CMS: İşletme paneli).
// Boş metin = bilgi yok: sitede gizlenir, JSON-LD'ye girmez.
import { isletme } from '../lib/icerik';
export { isletme };

export const tamAdres = () => {
  const a = isletme.adres;
  return `${a.sokak}, ${a.mekan}, ${a.postaKodu} ${a.ilce}/${a.il}`;
};

/** Rezervasyon kanalı: WhatsApp girilene kadar Instagram mesajı. */
export const rezervasyon = () =>
  isletme.whatsapp
    ? { url: `https://wa.me/${isletme.whatsapp.replace(/\D/g, '')}`, etiket: "WhatsApp'tan yaz", kanal: 'whatsapp' }
    : { url: isletme.instagram.dm, etiket: "Instagram'dan yaz", kanal: 'instagram' };
