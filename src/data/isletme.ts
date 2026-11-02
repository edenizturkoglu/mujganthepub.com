// Müjgân işletme bilgileri — sitedeki tek kaynak.
// Kural (CLAUDE.md): bilinmeyen bilgi uydurulmaz. Değeri olmayan alan `null` kalır.
// Taslakta (yayinda: false) eksik alan `[DOLDURULACAK: ...]` olarak görünür; canlıda hiç görünmez.
// Doğrulanmamış alan JSON-LD'ye girmez.

export type Alan<T = string> = {
  deger: T | null;
  dogrulandi: boolean;
  /** Eksik/doğrulanmamışken taslakta görünecek not */
  bekleyen: string;
};

export const isletme = {
  /** true: arama motorlarına açık, yer tutucular gizli. (2 Kasım 2026, Deniz: canlıya alınıyor) */
  yayinda: true,
  /** Canlı alan adı (GoDaddy'de kayıtlı, 2 Kasım 2026) */
  site: 'https://mujganthepub.com',

  ad: 'Müjgân',
  tamAd: 'Müjgân Çayyolu',
  digerAdlar: ['Müjgân Çayyolu', 'Müjgân The Pub'],
  kurulus: '2015',
  konum: 'Beysupark AVM, Çayyolu',

  adres: {
    // Tolga Selçuk, 28 Ekim 2026 (WhatsApp): "Çayyolu Mahallesi S.Saltoğlu Bulvarı 209/16 Beysupark Avm Çankaya/Ankara"
    sokak: { deger: 'Çayyolu Mah. S. Saltoğlu Blv. No: 209/16', dogrulandi: true, bekleyen: 'resmî adres' } as Alan,
    mekan: 'Beysupark AVM',
    postaKodu: '06810',
    ilce: 'Çankaya',
    il: 'Ankara',
  },
  yakinSemtler: ['Çayyolu', 'Ümitköy', 'Beysukent', 'Alacaatlı'],

  telefon: { deger: null, dogrulandi: false, bekleyen: 'telefon numarası' } as Alan,
  /** Yalnızca rakam, ör. 905321234567. Bu hafta gelecek (Deniz, 2 Kasım 2026). */
  whatsapp: { deger: null, dogrulandi: false, bekleyen: 'WhatsApp rezervasyon numarası' } as Alan,
  haritaLinki: { deger: 'https://share.google/ZRj28q9zPogFmpwk9', dogrulandi: true, bekleyen: 'Google Haritalar pini' } as Alan,
  haritaAdi: 'Müjgân Çayyolu',
  girisTarifi: { deger: null, dogrulandi: false, bekleyen: 'AVM içinde giriş tarifi' } as Alan,
  otopark: { deger: null, dogrulandi: false, bekleyen: 'otopark bilgisi' } as Alan,

  saatler: {
    // Deniz, 2 Kasım 2026: "10:30 - 01:00 mekan saatleri", "Mutfak hep açık"
    acik: { deger: '10.30 – 01.00', dogrulandi: true, bekleyen: 'çalışma saatleri' } as Alan,
    acilis: '10:30',
    kapanis: '01:00',
    mutfak: 'Açık olduğumuz her saat',
  },

  /** Paket servis platformları; gelince { ad, url } eklenecek. */
  siparisPlatformlari: [] as { ad: string; url: string }[],

  instagram: { kullanici: 'mujganthepub', url: 'https://www.instagram.com/mujganthepub/', dm: 'https://ig.me/m/mujganthepub' },
};

export const tamAdres = () => {
  const a = isletme.adres;
  return `${a.sokak.deger}, ${a.mekan}, ${a.postaKodu} ${a.ilce}/${a.il}`;
};

/** Rezervasyon kanalı: WhatsApp gelene kadar Instagram mesajı. */
export const rezervasyon = () =>
  isletme.whatsapp.deger
    ? { url: `https://wa.me/${isletme.whatsapp.deger}`, etiket: "WhatsApp'tan yaz", kanal: 'whatsapp' }
    : { url: isletme.instagram.dm, etiket: "Instagram'dan yaz", kanal: 'instagram' };
