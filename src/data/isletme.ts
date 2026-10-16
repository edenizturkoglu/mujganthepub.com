// Müjgan işletme bilgileri — sitedeki tek kaynak.
// Kural (CLAUDE.md): bilinmeyen bilgi uydurulmaz. Değeri olmayan alan `null` kalır ve
// sitede `[DOLDURULACAK: ...]` olarak görünür. Doğrulanmamış alan JSON-LD'ye girmez.

export type Alan<T = string> = {
  deger: T | null;
  dogrulandi: boolean;
  /** Eksik/doğrulanmamışken sitede görünecek not */
  bekleyen: string;
};

export const isletme = {
  /** Site canlıya alınana kadar false: arama motorlarına noindex gider. */
  yayinda: false,

  ad: 'Müjgan',
  konum: 'Beysupark, Çayyolu',

  adres: {
    // Kullanıcının verdiği adres; resmî adres, birim no ve giriş henüz kesinleşmedi.
    sokak: { deger: 'S. Saltoğlu Blv. No:209/36', dogrulandi: false, bekleyen: 'resmî adres ve birim no' },
    mekan: 'Beysupark AVM',
    postaKodu: '06810',
    ilce: 'Çankaya',
    il: 'Ankara',
  },

  telefon: { deger: null, dogrulandi: false, bekleyen: 'telefon numarası' } as Alan,
  whatsapp: { deger: null, dogrulandi: false, bekleyen: 'WhatsApp numarası' } as Alan,
  haritaLinki: { deger: null, dogrulandi: false, bekleyen: 'Google Haritalar pini' } as Alan,
  girisTarifi: { deger: null, dogrulandi: false, bekleyen: 'AVM içinde giriş tarifi' } as Alan,
  otopark: { deger: null, dogrulandi: false, bekleyen: 'otopark bilgisi (doğrulanmadı)' } as Alan,
  rezervasyon: { deger: null, dogrulandi: false, bekleyen: 'rezervasyon yöntemi (telefon, WhatsApp, form?)' } as Alan,
  grupIletisim: { deger: null, dogrulandi: false, bekleyen: 'grup taleplerinin gideceği kişi/kanal' } as Alan,

  saatler: {
    ogle: { deger: null, dogrulandi: false, bekleyen: 'öğle servis saatleri' } as Alan,
    aksam: { deger: null, dogrulandi: false, bekleyen: 'akşam servis saatleri' } as Alan,
    mutfakKapanis: { deger: null, dogrulandi: false, bekleyen: 'mutfak kapanış saati' } as Alan,
    kapaliGun: { deger: null, dogrulandi: false, bekleyen: 'kapalı gün' } as Alan,
  },

  /** Paket servis platformları; seçilince { ad, url } eklenecek. */
  siparisPlatformlari: [] as { ad: string; url: string }[],

  /** Yaklaşan etkinlikler. Boşsa etkinlik bölümü hiç gösterilmez. */
  etkinlikler: [] as { tarih: string; baslik: string; aciklama?: string }[],

  instagram: { kullanici: 'mujganthepub', url: 'https://www.instagram.com/mujganthepub/' },
};

export const tamAdres = () => {
  const a = isletme.adres;
  return `${a.sokak.deger}, ${a.mekan}, ${a.postaKodu} ${a.ilce}/${a.il}`;
};
