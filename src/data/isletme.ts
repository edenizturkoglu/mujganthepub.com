// İşletme bilgileri — kaynak: src/icerik/isletme.json (CMS: İşletme paneli).
// Boş metin = bilgi yok: sitede gizlenir, JSON-LD'ye girmez.
import { isletme } from '../lib/icerik';
export { isletme };

export const tamAdres = () => {
  const a = isletme.adres;
  return `${a.sokak}, ${a.mekan}, ${a.postaKodu} ${a.ilce}/${a.il}`;
};

/** WhatsApp numarasını wa.me biçimine çevirir: "0536 049 96 99" / "+90 536…" / "536…" → "905360499699". */
export const waNumara = (n: string) => {
  let d = (n || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = '9' + d;          // 05xx… → 905xx…
  else if (d.length === 10 && d.startsWith('5')) d = '90' + d;    // 5xx… → 905xx…
  return d;
};
/** Arama bağlantısı ve yapısal veri için: "+905360499699". */
export const telUluslararasi = (n: string) => '+' + waNumara(n);
const WA_MESAJ = 'Merhaba, rezervasyon yapmak istiyorum.';

/** Rezervasyon kanalı: WhatsApp girilene kadar Instagram mesajı. */
export const rezervasyon = (mesaj = WA_MESAJ) =>
  isletme.whatsapp
    ? { url: `https://wa.me/${waNumara(isletme.whatsapp)}?text=${encodeURIComponent(mesaj)}`, etiket: "WhatsApp'tan yaz", kanal: 'whatsapp' }
    : { url: isletme.instagram.dm, etiket: "Instagram'dan yaz", kanal: 'instagram' };
