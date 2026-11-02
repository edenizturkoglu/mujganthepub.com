// "Öğeyi incele" mantığı: önizleme çerçevesindeki sayfada [data-cms] işaretli öğelerin üstüne gelince çerçeve çizer,
// tıklanınca seçer. Metinler yerinde düzenlenir; görsel/bağlantı/liste işlemleri yan panelden yapılır.
import { durum } from './durum';
import { ayir, oku, temizHtml } from './yol';
import { onizlemeSrc } from './ui';

export type Secim = {
  el: HTMLElement;
  /** "dosya:yol" — doğrudan düzenlenebilir alan; yoksa null (yalnızca liste/panel bilgisi) */
  alan: string | null;
  tur: string;
  /** İçinde bulunduğu liste ve öğe sırası */
  liste: string | null;
  oge: number | null;
  ogeEl: HTMLElement | null;
  /** Kart bağlantısı (data-cms-link) */
  baglanti: string | null;
  /** Bu bölüm bir form panelinden yönetiliyor */
  panel: string | null;
};

export const TUR_ADI: Record<string, string> = { text: 'Metin', html: 'Biçimli metin', image: 'Görsel', link: 'Buton / bağlantı', number: 'Sayı' };

let cerceve: HTMLIFrameElement;
let secimModu = true;
let secili: HTMLElement | null = null;
let secimDinleyici: (s: Secim | null) => void = () => {};

const doc = () => cerceve.contentDocument!;

export function baslat(iframe: HTMLIFrameElement, dinleyici: (s: Secim | null) => void) {
  cerceve = iframe;
  secimDinleyici = dinleyici;
  iframe.addEventListener('load', kur);
}

export function modAyarla(acik: boolean) {
  secimModu = acik;
  try { doc().documentElement.classList.toggle('cms-secim', acik); } catch { /* yükleniyor */ }
  if (!acik) sec(null);
}

function kur() {
  const d = doc();
  if (!d?.body) return;
  secili = null;
  const stil = d.createElement('style');
  stil.textContent = `
    .cms-secim [data-cms], .cms-secim [data-cms-oge], .cms-secim [data-cms-panel] { cursor: pointer; }
    .cms-kutu { position: fixed; pointer-events: none; z-index: 2147483000; border: 2px solid #4FA3FF; border-radius: 4px; transition: all .08s; display: none; }
    .cms-kutu.secili { border-color: #FFB020; box-shadow: 0 0 0 4px rgba(255,176,32,.25); }
    .cms-kutu span { position: absolute; left: -2px; top: -24px; background: #4FA3FF; color: #04111f; font: 700 11.5px/1 system-ui, sans-serif; padding: 5px 7px; border-radius: 4px 4px 4px 0; white-space: nowrap; }
    .cms-kutu.secili span { background: #FFB020; }
    [contenteditable] { outline: none !important; caret-color: #FFB020; }
    .cms-secim .marquee-track { animation-play-state: paused !important; }
  `;
  d.head.append(stil);
  const uzerinde = d.createElement('div'); uzerinde.className = 'cms-kutu'; uzerinde.append(d.createElement('span'));
  const secKutu = d.createElement('div'); secKutu.className = 'cms-kutu secili'; secKutu.append(d.createElement('span'));
  d.body.append(uzerinde, secKutu);
  d.documentElement.classList.toggle('cms-secim', secimModu);

  // Önce tıklanan öğenin kendisi; değilse imlecin altındaki katmanlarda (karartma katmanı altındaki görseller) düzenlenebilir alan aranır
  const hedef = (t: EventTarget | null, x?: number, y?: number) => {
    const dogrudan = (t as Element | null)?.closest?.('[data-cms]') as HTMLElement | null;
    if (dogrudan) return dogrudan;
    if (x !== undefined && y !== undefined) {
      const alt = d.elementsFromPoint(x, y).map((e) => e.closest('[data-cms]')).find((e) => e && !e.classList.contains('cms-kutu')) as HTMLElement | undefined;
      if (alt) return alt;
    }
    return (t as Element | null)?.closest?.('[data-cms-oge], [data-cms-panel]') as HTMLElement | null;
  };
  const yerlestir = (k: HTMLElement, el: HTMLElement | null) => {
    if (!el || !el.isConnected) { k.style.display = 'none'; return; }
    const r = el.getBoundingClientRect();
    Object.assign(k.style, { display: 'block', left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` });
    k.querySelector('span')!.textContent = etiket(el);
  };

  d.addEventListener('mousemove', (e) => { if (secimModu) yerlestir(uzerinde, hedef(e.target, e.clientX, e.clientY)); else uzerinde.style.display = 'none'; }, true);
  d.addEventListener('mouseleave', () => { uzerinde.style.display = 'none'; });
  const takip = () => { yerlestir(secKutu, secili); if (secimModu) uzerinde.style.display = 'none'; };
  d.defaultView!.addEventListener('scroll', takip, { passive: true });
  d.defaultView!.addEventListener('resize', takip);

  d.addEventListener('click', (e) => {
    if (!secimModu) return;
    const el = hedef(e.target, e.clientX, e.clientY);
    if (el?.isContentEditable) return; // yazarken tıklama
    e.preventDefault(); e.stopPropagation();
    sec(el);
  }, true);
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') sec(null); });

  // Bağlantılar seçim modunda başka sayfaya geçirmesin; gezinme modunda iç bağlantılar çerçevede açılır
  d.querySelectorAll('a[target="_blank"]').forEach((a) => a.addEventListener('click', (e) => { if (!secimModu) return; e.preventDefault(); }));

  bekleyenleriUygula();
  (kur as any).yerlestir = () => yerlestir(secKutu, secili);
  secimDinleyici(null);
}

function etiket(el: HTMLElement) {
  const tur = el.dataset.cmsTur;
  if (tur) return TUR_ADI[tur] ?? tur;
  if (el.dataset.cmsOge !== undefined) return 'Liste öğesi';
  if (el.dataset.cmsPanel) return `${PANEL_ADI[el.dataset.cmsPanel] ?? el.dataset.cmsPanel} panelinden düzenlenir`;
  return '';
}
export const PANEL_ADI: Record<string, string> = { menu: 'Menü', etkinlikler: 'Etkinlikler', isletme: 'İşletme' };

export function sec(el: HTMLElement | null) {
  const d = (() => { try { return doc(); } catch { return null; } })();
  if (secili && secili !== el) duzenlemeyiBitir(secili);
  secili = el;
  const k = d?.querySelector('.cms-kutu.secili') as HTMLElement | null;
  if (k) {
    if (el) { const r = el.getBoundingClientRect(); Object.assign(k.style, { display: 'block', left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` }); k.querySelector('span')!.textContent = etiket(el); }
    else k.style.display = 'none';
  }
  if (!el) { secimDinleyici(null); return; }
  const ogeEl = el.closest('[data-cms-oge]') as HTMLElement | null;
  const listeEl = ogeEl?.parentElement?.closest('[data-cms-liste]') as HTMLElement | null;
  const s: Secim = {
    el, alan: el.dataset.cms ?? null, tur: el.dataset.cmsTur ?? '',
    liste: listeEl?.dataset.cmsListe ?? null, oge: ogeEl ? Number(ogeEl.dataset.cmsOge) : null, ogeEl,
    baglanti: (el.closest('[data-cms-link]') as HTMLElement | null)?.dataset.cmsLink ?? null,
    panel: (el.closest('[data-cms-panel]') as HTMLElement | null)?.dataset.cmsPanel ?? null,
  };
  if (s.alan && ['text', 'html', 'number'].includes(s.tur)) duzenlemeyiBaslat(el, s);
  secimDinleyici(s);
}

function duzenlemeyiBaslat(el: HTMLElement, s: Secim) {
  try { el.contentEditable = s.tur === 'html' ? 'true' : 'plaintext-only'; } catch { el.contentEditable = 'true'; }
  el.focus();
  el.oninput = () => {
    const { dosya, yol } = ayir(s.alan!);
    let v: unknown = s.tur === 'html' ? temizHtml(el.innerHTML) : el.innerText.replace(/\n+/g, ' ').trim();
    if (s.tur === 'number') { const n = Number(String(v).replace(/\./g, '').replace(',', '.')); v = Number.isFinite(n) ? n : v; }
    durum.ayarla(dosya, yol, v, alanEtiketi(s.alan!));
    window.dispatchEvent(new CustomEvent('cms-yerinde', { detail: { alan: s.alan, deger: v } }));
    (kur as any).yerlestir?.();
  };
  el.onkeydown = (e) => { if (e.key === 'Enter' && s.tur !== 'html') { e.preventDefault(); el.blur(); } };
}

function duzenlemeyiBitir(el: HTMLElement) {
  if (el.isContentEditable) { el.contentEditable = 'false'; el.removeAttribute('contenteditable'); el.oninput = null; el.onkeydown = null; }
}

/** "menu:kategoriler.2.kalemler.0.fiyat" → "Menü › Kategori 3 › Kalem 1 › fiyat" */
export function alanEtiketi(tam: string) {
  const { dosya, yol } = ayir(tam);
  const ad: Record<string, string> = { ana: 'Ana sayfa', menu: 'Menü', etkinlikler: 'Etkinlikler', isletme: 'İşletme', seo: 'SEO' };
  const parca = yol.split('.').map((p, i, a) => (/^\d+$/.test(p) ? `${a[i - 1] ?? ''} ${Number(p) + 1}` : p)).filter((p, i, a) => !/^\d+$/.test(a[i + 1] ?? ''));
  return [ad[dosya] ?? dosya.replace('sayfalar/', 'Sayfa: '), ...parca].join(' › ');
}

/** Çerçeve yeniden yüklenince yayınlanmamış değişiklikleri sayfaya geri uygular */
export function bekleyenleriUygula() {
  let d: Document;
  try { d = doc(); } catch { return; }
  if (!d?.body) return;
  d.querySelectorAll<HTMLElement>('[data-cms]').forEach((el) => {
    const { dosya, yol } = ayir(el.dataset.cms!);
    if (!durum.degisiklikler.some((x) => x.dosya === dosya && (yol === x.yol || yol.startsWith(x.yol + '.') || x.yol.startsWith(yol + '.')))) return;
    alaniCiz(el, oku(durum.calisma[dosya], yol));
  });
}

/** Bir alanın yeni değerini önizlemeye yansıtır */
export function alaniCiz(el: HTMLElement, v: any) {
  if (v === undefined) return;
  const tur = el.dataset.cmsTur;
  if (tur === 'image' && el.tagName === 'IMG') {
    const img = el as HTMLImageElement;
    img.removeAttribute('srcset'); img.src = onizlemeSrc(v.src); img.alt = v.alt ?? '';
    img.style.objectPosition = v.konum ?? '';
    if (v.w && v.h) { img.width = v.w; img.height = v.h; }
  } else if (tur === 'link') {
    el.textContent = v.metin ?? ''; if (el.tagName === 'A') el.setAttribute('href', v.link ?? '#');
  } else if (tur === 'html') {
    if (!el.isContentEditable) el.innerHTML = v;
  } else if (tur === 'number') {
    if (!el.isContentEditable) el.textContent = typeof v === 'number' ? new Intl.NumberFormat('tr-TR').format(v) : String(v);
  } else if (!el.isContentEditable) el.textContent = String(v ?? '');
}

/** Aynı alanı gösteren tüm öğeleri günceller (panelden yapılan değişiklikler için) */
export function onizle(tam: string, v: unknown) {
  let d: Document;
  try { d = doc(); } catch { return; }
  d?.querySelectorAll<HTMLElement>(`[data-cms="${CSS.escape(tam)}"]`).forEach((el) => alaniCiz(el, v));
  (kur as any).yerlestir?.();
}

// ---------- Liste işlemleri (önizlemede de uygulanır) ----------
function yenidenNumarala(listeEl: HTMLElement, liste: string) {
  const ogeler = [...listeEl.querySelectorAll<HTMLElement>('[data-cms-oge]')].filter((o) => o.parentElement?.closest('[data-cms-liste]') === listeEl);
  ogeler.forEach((o, j) => {
    const eski = o.dataset.cmsOge!;
    const onEk = `${liste}.${eski}`;
    o.dataset.cmsOge = String(j);
    o.querySelectorAll<HTMLElement>('[data-cms], [data-cms-liste], [data-cms-link]').forEach((x) => {
      for (const ad of ['cms', 'cmsListe', 'cmsLink'] as const) {
        const v = x.dataset[ad];
        if (v && (v === onEk || v.startsWith(onEk + '.'))) x.dataset[ad] = `${liste}.${j}` + v.slice(onEk.length);
      }
    });
  });
}

export function listeIslem(s: Secim, islem: 'yukari' | 'asagi' | 'kopyala' | 'sil') {
  if (!s.liste || s.oge === null || !s.ogeEl) return;
  const { dosya, yol } = ayir(s.liste);
  const dizi = [...(oku(durum.calisma[dosya], yol) as unknown[])];
  const i = s.oge;
  const listeEl = s.ogeEl.parentElement!.closest('[data-cms-liste]') as HTMLElement;
  if (islem === 'sil') { dizi.splice(i, 1); s.ogeEl.remove(); }
  if (islem === 'kopyala') { dizi.splice(i + 1, 0, JSON.parse(JSON.stringify(dizi[i]))); s.ogeEl.after(s.ogeEl.cloneNode(true)); }
  if (islem === 'yukari' && i > 0) { [dizi[i - 1], dizi[i]] = [dizi[i], dizi[i - 1]]; s.ogeEl.previousElementSibling?.before(s.ogeEl); }
  if (islem === 'asagi' && i < dizi.length - 1) { [dizi[i + 1], dizi[i]] = [dizi[i], dizi[i + 1]]; s.ogeEl.nextElementSibling?.after(s.ogeEl); }
  durum.ayarla(dosya, yol, dizi, `${alanEtiketi(s.liste)} (sıra / öğe)`);
  yenidenNumarala(listeEl, s.liste);
  // Marquee gibi tekrar eden listeler: ikinci kopyayı da eşitle
  sec(islem === 'sil' ? null : s.ogeEl);
}

export function cerceveBelgesi() { try { return doc(); } catch { return null; } }
