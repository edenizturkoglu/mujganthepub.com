// Küçük DOM yardımcıları ve ortak form alanları.
import { durum } from './durum';
import { slugla } from './yol';

type Ozel = Record<string, any> & { on?: Record<string, (e: any) => void> };
export function h<K extends keyof HTMLElementTagNameMap>(etiket: K, oz: Ozel = {}, ...cocuk: (Node | string | null | undefined | false)[]) {
  const el = document.createElement(etiket);
  for (const [k, v] of Object.entries(oz)) {
    if (v === undefined) continue;
    if (k === 'on') Object.entries(v as Record<string, any>).forEach(([o, f]) => el.addEventListener(o, f));
    else if (k === 'class') el.className = v;
    else if (k in el && k !== 'list') (el as any)[k] = v;
    else if (v !== false && v != null) el.setAttribute(k, String(v));
  }
  for (const c of cocuk) if (c != null && c !== false) el.append(c);
  return el;
}

export function bildirim(metin: string, tur: 'ok' | 'hata' | 'bilgi' = 'bilgi') {
  const k = document.getElementById('bildirimler')!;
  const b = h('div', { class: `bildirim ${tur}`, role: 'status' }, metin);
  k.append(b);
  setTimeout(() => b.remove(), tur === 'hata' ? 7000 : 3500);
}

/** Etiketli metin/sayı/uzun metin alanı; her değişiklikte `kaydet` çağrılır */
export function alan(etiket: string, deger: string | number | undefined, kaydet: (v: string) => void,
  o: { tur?: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'url' | 'tel'; ipucu?: string; sayac?: [number, number]; yer?: string } = {}) {
  const tur = o.tur ?? 'text';
  const girdi = tur === 'textarea'
    ? h('textarea', { rows: 3, value: deger ?? '', placeholder: o.yer ?? '' })
    : h('input', { type: tur, value: deger ?? '', placeholder: o.yer ?? '', step: tur === 'number' ? 'any' : undefined });
  const sayac = o.sayac ? h('span', { class: 'sayac' }) : null;
  const guncelle = () => {
    if (!sayac || !o.sayac) return;
    const n = girdi.value.length;
    sayac.textContent = `${n} karakter`;
    sayac.className = 'sayac ' + (n < o.sayac[0] ? 'uyari' : n > o.sayac[1] ? 'hata' : 'iyi');
  };
  girdi.addEventListener('input', () => { kaydet(girdi.value); guncelle(); });
  guncelle();
  return h('label', { class: 'alan' }, h('span', { class: 'alan-ad' }, etiket, sayac), girdi, o.ipucu ? h('small', {}, o.ipucu) : null);
}

export function onay(etiket: string, deger: boolean, kaydet: (v: boolean) => void, ipucu?: string) {
  const c = h('input', { type: 'checkbox', checked: deger, on: { change: () => kaydet(c.checked) } });
  return h('label', { class: 'alan onay' }, c, h('span', {}, etiket), ipucu ? h('small', {}, ipucu) : null);
}

export function secim(etiket: string, deger: string, secenekler: [string, string][], kaydet: (v: string) => void) {
  const s = h('select', { on: { change: () => kaydet(s.value) } }, ...secenekler.map(([v, a]) => h('option', { value: v, selected: v === deger }, a)));
  return h('label', { class: 'alan' }, h('span', { class: 'alan-ad' }, etiket), s);
}

export function dugme(metin: string, f: () => void, sinif = '') {
  return h('button', { type: 'button', class: `d ${sinif}`, on: { click: f } }, metin);
}

// ---------- Görsel yükleme ve seçme ----------
const ODAK: [string, string][] = [['0% 0%', '↖'], ['50% 0%', '↑'], ['100% 0%', '↗'], ['0% 50%', '←'], ['50% 50%', '•'], ['100% 50%', '→'], ['0% 100%', '↙'], ['50% 100%', '↓'], ['100% 100%', '↘']];

export type GorselDeger = { src: string; alt: string; konum?: string; w?: number; h?: number };

/** Dosyayı web boyutuna indirir (en uzun kenar 1600 px, JPEG %82) ve yükleme listesine ekler */
export async function gorselYukle(dosya: File): Promise<GorselDeger> {
  const url = URL.createObjectURL(dosya);
  const img = await new Promise<HTMLImageElement>((ok, hata) => { const i = new Image(); i.onload = () => ok(i); i.onerror = hata; i.src = url; });
  const olcek = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * olcek), hh = Math.round(img.naturalHeight * olcek);
  const c = document.createElement('canvas'); c.width = w; c.height = hh;
  c.getContext('2d')!.drawImage(img, 0, 0, w, hh);
  const dataUrl = c.toDataURL('image/jpeg', 0.82);
  URL.revokeObjectURL(url);
  const ad = `${slugla(dosya.name.replace(/\.[^.]+$/, '')) || 'gorsel'}-${Date.now().toString(36)}.jpg`;
  const src = `/img/yukleme/${ad}`;
  durum.yuklemeEkle({ yol: `public${src}`, src, base64: dataUrl.split(',')[1], onizleme: dataUrl });
  return { src, alt: '', w, h: hh };
}

/** Yüklenmiş ama henüz yayınlanmamış görselin önizleme adresi */
export const onizlemeSrc = (src: string) => durum.yuklemeler.find((y) => y.src === src)?.onizleme ?? src;

export function gorselAlani(deger: GorselDeger | undefined, kaydet: (v: GorselDeger) => void, etiket = 'Görsel') {
  let g: GorselDeger = deger ? { ...deger } : { src: '', alt: '' };
  const kapsayici = h('div', { class: 'gorsel-alani' });
  const ciz = () => {
    kapsayici.replaceChildren(
      h('span', { class: 'alan-ad' }, etiket),
      g.src ? h('img', { class: 'gorsel-onizleme', src: onizlemeSrc(g.src), alt: '', style: g.konum ? `object-position:${g.konum}` : '' }) : h('div', { class: 'gorsel-bos' }, 'Görsel yok'),
      h('div', { class: 'satir' },
        h('label', { class: 'd ana' }, 'Yeni görsel yükle',
          h('input', { type: 'file', accept: 'image/*', hidden: true, on: { change: async (e: Event) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (!f) return;
            const yeni = await gorselYukle(f);
            g = { ...yeni, alt: g.alt, konum: g.konum }; kaydet(g); ciz();
          } } })),
        dugme('Siteden seç', () => gorselSec((src) => { g = { ...g, src, w: undefined, h: undefined }; kaydet(g); ciz(); })),
      ),
      alan('Alternatif metin (SEO ve erişilebilirlik)', g.alt, (v) => { g.alt = v; kaydet(g); }, { ipucu: 'Görselde ne olduğunu kısaca yaz: "Masada burger ve patates"' }),
      h('div', { class: 'alan' }, h('span', { class: 'alan-ad' }, 'Odak noktası (kırpılınca görünecek yer)'),
        h('div', { class: 'odak' }, ...ODAK.map(([v, ok]) => h('button', { type: 'button', class: (g.konum ?? '50% 50%') === v ? 'secili' : '', title: v,
          on: { click: () => { g.konum = v === '50% 50%' ? undefined : v; kaydet(g); ciz(); } } }, ok)))),
    );
  };
  ciz();
  return kapsayici;
}

export function gorselSec(sec: (src: string) => void) {
  const kapat = () => modal.remove();
  const modal = h('div', { class: 'modal', on: { click: (e: Event) => { if (e.target === modal) kapat(); } } },
    h('div', { class: 'modal-ic' },
      h('div', { class: 'modal-bas' }, h('b', {}, 'Siteden görsel seç'), dugme('Kapat', kapat)),
      h('div', { class: 'galeri' }, ...durum.gorseller.map((src) =>
        h('button', { type: 'button', on: { click: () => { sec(src); kapat(); } } }, h('img', { src: onizlemeSrc(src), alt: src, loading: 'lazy' })))),
    ));
  document.body.append(modal);
}

/** Dizi düzenleyici: her öğe için satır çizer; ekle/sil/taşı düğmeleriyle */
export function liste<T>(ogeler: T[], ciz: (o: T, i: number, guncelle: (y: T) => void) => Node, degisti: (y: T[]) => void,
  o: { yeni?: () => T; ekleMetni?: string; baslik?: (x: T, i: number) => string; acik?: boolean } = {}) {
  const k = h('div', { class: 'liste' });
  const yenile = () => {
    k.replaceChildren(...ogeler.map((x, i) => {
      const guncelle = (y: T) => { ogeler[i] = y; degisti([...ogeler]); };
      const tasi = (d: number) => { const j = i + d; if (j < 0 || j >= ogeler.length) return; [ogeler[i], ogeler[j]] = [ogeler[j], ogeler[i]]; degisti([...ogeler]); yenile(); };
      const govde = ciz(x, i, guncelle);
      const arac = h('div', { class: 'liste-arac' },
        h('button', { type: 'button', title: 'Yukarı', on: { click: () => tasi(-1) } }, '↑'),
        h('button', { type: 'button', title: 'Aşağı', on: { click: () => tasi(1) } }, '↓'),
        h('button', { type: 'button', title: 'Sil', class: 'sil', on: { click: () => { ogeler.splice(i, 1); degisti([...ogeler]); yenile(); } } }, '✕'));
      if (o.baslik) {
        const d = h('details', { class: 'liste-oge', open: o.acik ?? false }, h('summary', {}, h('span', {}, o.baslik(x, i)), arac), govde);
        return d;
      }
      return h('div', { class: 'liste-oge satirli' }, govde, arac);
    }), o.yeni ? dugme(o.ekleMetni ?? '+ Ekle', () => { ogeler.push(o.yeni!()); degisti([...ogeler]); yenile(); }, 'ekle') : '');
  };
  yenile();
  return k;
}
