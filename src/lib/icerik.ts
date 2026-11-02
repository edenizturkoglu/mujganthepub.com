// İçerik katmanı: sitedeki tüm metin, görsel ve bilgiler src/icerik/*.json dosyalarındadır.
// /admin CMS bu dosyaları GitHub üzerinden düzenler; şablonlar yalnızca buradan okur.
import isletmeJson from '../icerik/isletme.json';
import anaJson from '../icerik/ana.json';
import menuJson from '../icerik/menu.json';
import etkinliklerJson from '../icerik/etkinlikler.json';
import seoJson from '../icerik/seo.json';

export type Gorsel = { src: string; alt: string; konum?: string; w?: number; h?: number };
export type Seo = { baslik: string; aciklama: string; kapak: string; indeksle: boolean };

export const isletme = isletmeJson;
export const ana = anaJson;
export const menuIcerik = menuJson;
export const etkinlikIcerik = etkinliklerJson;
export const seo = seoJson as Record<string, Seo>;

// ---- Özel sayfalar (CMS'ten oluşturulanlar) ----
export type Blok =
  | { tur: 'kapak'; ust?: string; baslik: string; metin?: string; gorsel: Gorsel }
  | { tur: 'metin'; ust?: string; baslik?: string; metin: string }
  | { tur: 'gorsel-metin'; ust?: string; baslik: string; metin: string; gorsel: Gorsel; ters?: boolean }
  | { tur: 'galeri'; baslik?: string; gorseller: Gorsel[] }
  | { tur: 'cagri'; baslik: string; metin?: string; buton: { metin: string; link: string } };
export type OzelSayfa = { baslik: string; menudeGoster: boolean; seo: Seo; bloklar: Blok[] };

const dosyalar = import.meta.glob<{ default: OzelSayfa }>('../icerik/sayfalar/*.json', { eager: true });
export const ozelSayfalar = Object.entries(dosyalar).map(([yol, mod]) => ({
  slug: yol.split('/').pop()!.replace(/\.json$/, ''),
  ...mod.default,
}));

/** Tıkla-düzenle için öznitelikler: CMS, `dosya:json.yolu` ile alanı bulur. */
export type Tur = 'text' | 'html' | 'image' | 'link' | 'number';
export const cms = (yol: string, tur: Tur = 'text') => ({ 'data-cms': yol, 'data-cms-tur': tur });
/** Liste kapsayıcısı (öğe ekle/sil/taşı) */
export const cmsListe = (yol: string) => ({ 'data-cms-liste': yol });
