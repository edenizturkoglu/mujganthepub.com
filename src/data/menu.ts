// Menü — kalemler ve fiyatlar henüz işletmeden gelmedi (docs/acik-sorular.md).
// Kalem eklerken: fiyat TL cinsinden sayı; `ogle: true` öğle seçeneği işaretidir.
// Kalori/protein vb. yalnızca işletmenin doğruladığı veriyle `icerik` alanına yazılır.
// Alkollü içecek bölümleri sade liste: promosyon, indirim veya özendirici dil yok.

export type MenuKalemi = {
  ad: string;
  aciklama?: string;
  fiyat: number | null;
  ogle?: boolean;
  icerik?: string;
};

export type MenuKategori = {
  id: string;
  baslik: string;
  not?: string;
  alkollu?: boolean;
  kalemler: MenuKalemi[];
};

export const menu: MenuKategori[] = [
  { id: 'baslangiclar', baslik: 'Başlangıçlar', kalemler: [] },
  { id: 'ana-yemekler', baslik: 'Ana yemekler', kalemler: [] },
  { id: 'ogle', baslik: 'Öğle seçenekleri', not: 'Öğle servisine özel tabaklar.', kalemler: [] },
  { id: 'tatlilar', baslik: 'Tatlılar', kalemler: [] },
  { id: 'alkolsuz', baslik: 'Alkolsüz içecekler', kalemler: [] },
  { id: 'kokteyller', baslik: 'Kokteyller', alkollu: true, kalemler: [] },
  { id: 'sarap', baslik: 'Şarap', not: 'Şarap tabağı ve sıcak şarap dahil.', alkollu: true, kalemler: [] },
  { id: 'viski', baslik: 'Single malt', alkollu: true, kalemler: [] },
];

export const fiyatYaz = (f: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f) + ' ₺';
