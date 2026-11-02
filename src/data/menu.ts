// Menü — kaynak: src/icerik/menu.json (CMS: Menü paneli).
import { menuIcerik } from '../lib/icerik';
export const menu = menuIcerik.kategoriler;
export type MenuKategori = (typeof menu)[number];
export const izgaraSirasi = menuIcerik.izgaraSirasi;
export const toplamKalem = () => menu.reduce((n, k) => n + k.kalemler.length, 0);
export const enDusuk = (k: MenuKategori) => Math.min(...k.kalemler.map((x) => (typeof x.fiyat === 'number' ? x.fiyat : Infinity)));
export const fiyatYaz = (f: number) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(f);
