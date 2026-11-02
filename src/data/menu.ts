// Menü — kaynak: Tolga Selçuk'un 31 Ekim 2026'da gönderdiği menü.xlsx (34 kalem, TL).
// Ürün adları işletmenin yazdığı gibi; "Basket" kategorisinde ek sözcük kısaltıldı.
// Kalori/protein vb. yalnızca işletmenin doğruladığı veriyle `icerik` alanına yazılır.
// İçecek menüsü henüz yok (docs/acik-sorular.md).

export type MenuKalemi = {
  ad: string;
  aciklama?: string;
  fiyat: number | null;
  icerik?: string;
};

export type MenuKategori = {
  id: string;
  baslik: string;
  alt?: string;
  /** Kategori fotoğrafı (yemek eşleştirmesi değil, kategori atmosferi) */
  foto: { src: string; alt: string; konum?: string };
  /** Ana sayfadaki yemek ızgarasında kaplayacağı alan */
  izgara?: { src: string; alt: string; sinif?: string; konum?: string };
  alkollu?: boolean;
  kalemler: MenuKalemi[];
};

export const menu: MenuKategori[] = [
  {
    id: 'burgerler', baslik: 'Burgerler',
    foto: { src: '/img/hgp-5542.jpg', alt: 'Patates ve sosla servis edilen burger', konum: '50% 55%' },
    izgara: { src: '/img/hgp-5593.jpg', alt: 'Burger ve patates', sinif: 'b-wide' },
    kalemler: [
      { ad: 'Smash Burger', fiyat: 650 }, { ad: 'Oklahoma Onion', fiyat: 650 },
      { ad: 'Hot Honey Smash', fiyat: 675 }, { ad: 'Truffle Mushroom', fiyat: 675 },
      { ad: 'BBQ Smoke Burger', fiyat: 675 },
    ],
  },
  {
    id: 'tost-sandvic', baslik: 'Kore Tost / Sandviçler',
    foto: { src: '/img/hgp-5645.jpg', alt: 'Müjgân kutusunda tost ve patates', konum: '50% 40%' },
    izgara: { src: '/img/hgp-5645.jpg', alt: 'Müjgân kutusunda tost', sinif: 'b-wide', konum: '50% 35%' },
    kalemler: [
      { ad: 'Crispy Chicken Club', fiyat: 600 }, { ad: 'Hot Honey Chicken Parmesan', fiyat: 600 },
      { ad: 'Korean BBQ Chicken Toast', fiyat: 625 }, { ad: 'Pulled Beef Melt', fiyat: 725 },
    ],
  },
  {
    id: 'baskets', baslik: 'Baskets', alt: 'Sepette',
    foto: { src: '/img/hgp-5259.jpg', alt: 'Soslu çıtır tavuk', konum: '50% 60%' },
    izgara: { src: '/img/hgp-5259.jpg', alt: 'Soslu çıtır tavuk', sinif: 'b-tall', konum: '50% 60%' },
    kalemler: [
      { ad: 'Crispy Chicken', fiyat: 550 }, { ad: 'Red Hot Chili Chicken', fiyat: 575 },
      { ad: 'Korean Chicken', fiyat: 575 }, { ad: 'Hot Honey Halloumi', fiyat: 550 },
      { ad: 'Mac & Cheese Bites', fiyat: 450 },
    ],
  },
  {
    id: 'pizzalar', baslik: 'Pizzalar',
    foto: { src: '/img/hgp-6088.jpg', alt: 'Masada pizza ve kokteyl', konum: '50% 70%' },
    izgara: { src: '/img/hgp-6110.jpg', alt: 'Masada pizza', konum: '50% 70%' },
    kalemler: [
      { ad: 'Margherita', fiyat: 625 }, { ad: 'Truffle Mushroom', fiyat: 695 },
      { ad: 'Hot Honey Pepperoni', fiyat: 695 }, { ad: 'Four Cheese', fiyat: 695 },
      { ad: 'Pulled Beef', fiyat: 775 },
    ],
  },
  {
    id: 'paylasmalik', baslik: 'Paylaşmalık', alt: 'Small / Share',
    foto: { src: '/img/hgp-5680.jpg', alt: 'Ahşap tahtada peynir, ceviz ve elma tabağı' },
    izgara: { src: '/img/hgp-5680.jpg', alt: 'Peynir tabağı', sinif: 'b-wide' },
    kalemler: [
      { ad: 'Patates Kızartması', fiyat: 325 }, { ad: 'Truffle Parmesan Fries', fiyat: 395 },
      { ad: 'Çıtır Zeytin', fiyat: 250 }, { ad: 'Wine Plate', fiyat: 650 },
    ],
  },
  {
    id: 'bowls', baslik: 'Bowls',
    foto: { src: '/img/hgp-5477.jpg', alt: 'Tavuklu, edamameli bowl' },
    izgara: { src: '/img/hgp-5493.jpg', alt: 'Etli bowl', sinif: 'b-tall' },
    kalemler: [
      { ad: 'Korean BBQ Chicken Bowl', fiyat: 650 }, { ad: 'Hot Honey Chicken Bowl', fiyat: 650 },
      { ad: 'Pulled Beef Bowl', fiyat: 775 }, { ad: 'Grilled Halloumi Bowl', fiyat: 650 },
      { ad: 'Cesar Protein Plate', fiyat: 650 },
    ],
  },
  {
    id: 'ana-yemek', baslik: 'Ana Yemekler',
    foto: { src: '/img/hgp-5369.jpg', alt: 'Köfte, közlenmiş biber ve soğanla servis tabağı' },
    izgara: { src: '/img/hgp-5347.jpg', alt: 'Somon ızgara' },
    kalemler: [
      { ad: 'Falafel Köfte', fiyat: 550 }, { ad: 'Izgara Tavuk', fiyat: 575 },
      { ad: 'Cheesy Chicken', fiyat: 600 }, { ad: 'Creamy Mushroom Chicken', fiyat: 600 },
      { ad: 'Balkan Köfte', fiyat: 600 }, { ad: 'Somon Izgara', fiyat: 700 },
    ],
  },
];

/** Ana sayfa ızgarasındaki sıra */
export const izgaraSirasi = ['burgerler', 'baskets', 'bowls', 'pizzalar', 'paylasmalik', 'ana-yemek', 'tost-sandvic'];

export const toplamKalem = () => menu.reduce((n, k) => n + k.kalemler.length, 0);
export const enDusuk = (k: MenuKategori) => Math.min(...k.kalemler.map((x) => x.fiyat ?? Infinity));
export const fiyatYaz = (f: number) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f);
