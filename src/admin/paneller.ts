// Yan panel modülleri: Öğe, Menü, Etkinlikler, SEO, Sayfalar, İşletme, Değişiklikler.
import { durum } from './durum';
import { h, alan, onay, secim, dugme, gorselAlani, gorselSec, liste, onizlemeSrc, bildirim } from './ui';
import { Secim, TUR_ADI, PANEL_ADI, alanEtiketi, onizle, listeIslem, cerceveBelgesi, alaniCiz } from './secici';
import { ayir, oku, kopya, slugla, temizHtml } from './yol';

export type Baglam = {
  sayfaYolu: () => string;
  git: (yol: string) => void;
  panelAc: (ad: string) => void;
  yayinla: (mesaj: string) => void;
  site: string;
};

const baslik = (b: string, alt?: string) => h('div', { class: 'p-bas' }, h('h2', {}, b), alt ? h('p', {}, alt) : null);
const kutu = (...c: (Node | string | null | false)[]) => h('section', { class: 'kutu' }, ...c);
const not = (m: string) => h('p', { class: 'not' }, m);

// ===================== Öğe =====================
export function ogePaneli(s: Secim | null, b: Baglam) {
  if (!s) return h('div', {},
    baslik('Öğe', 'Önizlemede değiştirmek istediğin yazının ya da görselin üstüne tıkla.'),
    kutu(
      h('ul', { class: 'aciklama' },
        h('li', {}, h('b', {}, 'Mavi çerçeve: '), 'düzenlenebilir alan. Tıkla, yazıyı yerinde değiştir.'),
        h('li', {}, h('b', {}, 'Görsel: '), 'tıkla, sağdan yeni görsel yükle ya da siteden seç.'),
        h('li', {}, h('b', {}, 'Liste öğesi: '), 'menü ürünü, soru gibi tekrar eden öğeleri çoğalt, taşı, sil.'),
        h('li', {}, h('b', {}, 'Gezin modu: '), 'üstteki düğmeyle bağlantılara tıklayıp sayfalar arasında dolaş.'),
      )));
  const govde = h('div', {});
  if (s.alan) {
    const { dosya, yol } = ayir(s.alan);
    const deger = durum.al(dosya, yol);
    const kaydet = (v: unknown) => { durum.ayarla(dosya, yol, v, alanEtiketi(s.alan!)); onizle(s.alan!, v); };
    govde.append(baslik(TUR_ADI[s.tur] ?? 'Alan', alanEtiketi(s.alan)));
    if (s.tur === 'image') govde.append(kutu(gorselAlani(deger, kaydet)));
    else if (s.tur === 'link') {
      let v = { ...(deger ?? { metin: '', link: '' }) };
      govde.append(kutu(
        alan('Yazı', v.metin, (x) => { v = { ...v, metin: x }; kaydet(v); }),
        alan('Bağlantı', v.link, (x) => { v = { ...v, link: x }; kaydet(v); }, { tur: 'url', ipucu: 'Site içi: /menu/ · Bölüm: /#ulasim · Dış: https://…' }),
      ));
    } else if (s.tur === 'html') {
      govde.append(kutu(
        alan('İçerik', deger, (x) => kaydet(temizHtml(x)), { tur: 'textarea', ipucu: 'Önizlemede doğrudan da yazabilirsin. Vurgu için <em>kelime</em>, kalın için <strong>kelime</strong>, paragraf için <p>…</p>.' })));
    } else if (s.tur === 'number') {
      govde.append(kutu(alan('Değer', deger, (x) => { const n = Number(x); kaydet(Number.isFinite(n) && x !== '' ? n : x); }, { tur: 'number' })));
    } else {
      govde.append(kutu(alan('Metin', deger, (x) => kaydet(x), { tur: String(deger ?? '').length > 60 ? 'textarea' : 'text', ipucu: 'Önizlemede de doğrudan yazabilirsin; Enter ile bitir.' })));
    }
    // Önizlemede yerinde yazılınca paneldeki kutu da güncellensin
    const g = govde.querySelector<HTMLInputElement | HTMLTextAreaElement>('.kutu input:not([type=file]), .kutu textarea');
    const dinle = (e: Event) => {
      const { alan: a, deger: v } = (e as CustomEvent).detail;
      if (!govde.isConnected) { window.removeEventListener('cms-yerinde', dinle); return; }
      if (a === s.alan && g && document.activeElement !== g) g.value = String(v ?? '');
    };
    if (g && s.tur !== 'image' && s.tur !== 'link') window.addEventListener('cms-yerinde', dinle);
  } else {
    govde.append(baslik(s.panel ? `${PANEL_ADI[s.panel]} bölümü` : 'Liste öğesi'));
  }
  if (s.baglanti) {
    const { dosya, yol } = ayir(s.baglanti);
    govde.append(kutu(alan('Kartın bağlantısı', durum.al(dosya, yol), (v) => durum.ayarla(dosya, yol, v, alanEtiketi(s.baglanti!)), { tur: 'url' })));
  }
  const panelYonetir = s.panel && s.el.closest('[data-cms-panel]')?.contains(s.ogeEl ?? s.el);
  if (s.liste && s.oge !== null && !panelYonetir) {
    govde.append(kutu(h('span', { class: 'alan-ad' }, `${alanEtiketi(s.liste)} › ${s.oge + 1}. öğe`),
      h('div', { class: 'satir' },
        dugme('↑ Yukarı', () => listeIslem(s, 'yukari')), dugme('↓ Aşağı', () => listeIslem(s, 'asagi')),
        dugme('Çoğalt', () => listeIslem(s, 'kopyala')), dugme('Sil', () => listeIslem(s, 'sil'), 'tehlike'))));
  }
  if (s.panel) govde.append(kutu(not(`Bu bölümdeki kayıtlar (ekleme, silme, sıralama) ${PANEL_ADI[s.panel]} panelinden yönetilir.`),
    dugme(`${PANEL_ADI[s.panel]} panelini aç`, () => b.panelAc(s.panel!), 'ana')));
  return govde;
}

// ===================== Menü =====================
type Kalem = { ad: string; fiyat: number | string; aciklama?: string };
type Kategori = { id: string; baslik: string; alt?: string; foto: any; izgara: any; kalemler: Kalem[] };

export function menuPaneli(b: Baglam) {
  const m = durum.al('menu');
  if (!m) return not('Menü dosyası yüklenemedi.');
  const kaydet = (k: Kategori[], et = 'Menü') => durum.ayarla('menu', 'kategoriler', k, et);
  const kategoriler: Kategori[] = kopya(m.kategoriler);
  const sira: string[] = kopya(m.izgaraSirasi);
  return h('div', {},
    baslik('Menü', 'Kategoriler, ürünler ve fiyatlar. Fiyata yalnızca sayı yaz (650).'),
    h('div', { class: 'satir' }, dugme('Menü sayfasını aç', () => b.git('/menu/'))),
    kutu(
      alan('Sayfa başlığı', m.sayfa.baslik, (v) => { durum.ayarla('menu', 'sayfa.baslik', v); onizle('menu:sayfa.baslik', v); }),
      alan('Giriş metni', m.sayfa.metin, (v) => { durum.ayarla('menu', 'sayfa.metin', v); onizle('menu:sayfa.metin', v); }, { tur: 'textarea' }),
      alan('Alt not', m.sayfa.altNot, (v) => { durum.ayarla('menu', 'sayfa.altNot', v); onizle('menu:sayfa.altNot', v); }),
    ),
    h('h3', { class: 'ara' }, 'Kategoriler'),
    liste(kategoriler, (k, ki, guncelle) => h('div', { class: 'alt-form' },
      alan('Kategori adı', k.baslik, (v) => { k.baslik = v; guncelle(k); onizle(`menu:kategoriler.${ki}.baslik`, v); }),
      alan('Küçük not (isteğe bağlı)', k.alt ?? '', (v) => { k.alt = v || undefined; guncelle(k); }),
      onay('Ana sayfadaki yemek ızgarasında göster', sira.includes(k.id), (v) => {
        const i = sira.indexOf(k.id);
        if (v && i < 0) sira.push(k.id); if (!v && i >= 0) sira.splice(i, 1);
        durum.ayarla('menu', 'izgaraSirasi', [...sira], 'Menü › ana sayfa ızgarası');
      }),
      h('h4', {}, 'Ürünler'),
      liste(k.kalemler, (x, xi, g) => h('div', { class: 'kalem' },
        h('input', { value: x.ad, placeholder: 'Ürün adı', 'aria-label': 'Ürün adı', on: { input: (e: any) => { x.ad = e.target.value; g(x); onizle(`menu:kategoriler.${ki}.kalemler.${xi}.ad`, x.ad); } } }),
        h('input', { value: String(x.fiyat ?? ''), inputmode: 'numeric', placeholder: '₺', 'aria-label': 'Fiyat', class: 'fiyat',
          on: { input: (e: any) => { const n = Number(String(e.target.value).replace(/[^\d.,]/g, '').replace(',', '.')); x.fiyat = Number.isFinite(n) && e.target.value !== '' ? n : ''; g(x); onizle(`menu:kategoriler.${ki}.kalemler.${xi}.fiyat`, x.fiyat); } } }),
      ), (y) => { k.kalemler = y; guncelle(k); }, { yeni: () => ({ ad: 'Yeni ürün', fiyat: '' }), ekleMetni: '+ Ürün ekle' }),
      h('details', { class: 'ic' }, h('summary', {}, 'Kategori görselleri'),
        gorselAlani(k.foto, (g) => { k.foto = g; guncelle(k); onizle(`menu:kategoriler.${ki}.foto`, g); }, 'Menü sayfasındaki görsel'),
        gorselAlani(k.izgara, (g) => { k.izgara = { ...g, boyut: k.izgara?.boyut }; guncelle(k); onizle(`menu:kategoriler.${ki}.izgara`, k.izgara); }, 'Ana sayfa ızgara görseli'),
        secim('Izgaradaki boyut', k.izgara?.boyut ?? '', [['', 'Normal'], ['genis', 'Geniş'], ['uzun', 'Uzun']], (v) => { k.izgara = { ...k.izgara, boyut: v || undefined }; guncelle(k); })),
    ), (y) => kaydet(y), {
      baslik: (k) => `${k.baslik} · ${k.kalemler.length} ürün`,
      ekleMetni: '+ Kategori ekle',
      yeni: () => {
        let id = 'yeni-kategori', n = 2;
        while (kategoriler.some((k) => k.id === id)) id = `yeni-kategori-${n++}`;
        return { id, baslik: 'Yeni kategori', foto: { src: '/img/hgp-6041.jpg', alt: '' }, izgara: { src: '/img/hgp-6041.jpg', alt: '' }, kalemler: [{ ad: 'Yeni ürün', fiyat: '' }] };
      },
    }),
    not('Ürün ekleme, silme ve sıralama sitede yayınladıktan sonra görünür; ad ve fiyat değişiklikleri önizlemede hemen görünür.'),
  );
}

// ===================== Etkinlikler =====================
const GUNLER: [string, string, string, string][] = [
  ['wk', 'Hafta içi', 'Hafta içi her gün', 'Hafta içi'], ['1', 'Pazartesi', 'Her pazartesi', 'Pazartesi'], ['2', 'Salı', 'Her salı', 'Salı'],
  ['3', 'Çarşamba', 'Her çarşamba', 'Çarşamba'], ['4', 'Perşembe', 'Her perşembe', 'Perşembe'], ['5', 'Cuma', 'Her cuma', 'Cuma'],
  ['6', 'Cumartesi', 'Her cumartesi', 'Cumartesi'], ['0', 'Pazar', 'Her pazar', 'Pazar']];
const bugunIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export function etkinlikPaneli(b: Baglam) {
  const e = durum.al('etkinlikler');
  if (!e) return not('Etkinlik dosyası yüklenemedi.');
  const tarihli = kopya(e.etkinlikler) as { tarih: string; saat: string; baslik: string; tur: string }[];
  const geceler = kopya(e.geceler) as any[];
  const bugun = kopya(e.bugun) as any[];
  const gecmis = tarihli.filter((x) => x.tarih < bugunIso()).length;
  return h('div', {},
    baslik('Etkinlikler', 'Tarihli konserler, haftalık geceler ve ana sayfadaki "Bugün" kutusu.'),
    h('div', { class: 'satir' }, dugme('Etkinlikler sayfasını aç', () => b.git('/etkinlikler/'))),
    h('h3', { class: 'ara' }, 'Tarihli etkinlikler'),
    not('Tarihi geçen etkinlik sitede kendiliğinden gizlenir.'),
    liste(tarihli, (x, i, g) => h('div', { class: 'alt-form' },
      alan('Başlık (grup / etkinlik adı)', x.baslik, (v) => { x.baslik = v; g(x); }),
      alan('Tür', x.tur, (v) => { x.tur = v; g(x); }, { yer: 'Canlı müzik, Caz, Stand-up…' }),
      h('div', { class: 'iki' }, alan('Tarih', x.tarih, (v) => { x.tarih = v; g(x); }, { tur: 'date' }), alan('Saat', x.saat, (v) => { x.saat = v; g(x); }, { tur: 'time' })),
    ), (y) => durum.ayarla('etkinlikler', 'etkinlikler', y, 'Etkinlikler › tarihli etkinlikler'), {
      baslik: (x) => `${x.tarih.split('-').reverse().join('.')} · ${x.baslik}${x.tarih < bugunIso() ? ' (geçti)' : ''}`,
      ekleMetni: '+ Etkinlik ekle', acik: false,
      yeni: () => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); return { tarih: d.toISOString().slice(0, 10), saat: '20:00', baslik: 'Yeni etkinlik', tur: 'Canlı müzik' }; },
    }),
    gecmis ? dugme(`Geçmiş ${gecmis} etkinliği temizle`, () => { durum.ayarla('etkinlikler', 'etkinlikler', tarihli.filter((x) => x.tarih >= bugunIso()), 'Etkinlikler › geçmişler temizlendi'); b.panelAc('etkinlikler'); }) : '',

    h('h3', { class: 'ara' }, 'Haftalık geceler'),
    liste(geceler, (g, i, gun) => h('div', { class: 'alt-form' },
      secim('Gün', g.gun, GUNLER.map(([v, a]) => [v, a]), (v) => { const r = GUNLER.find((x) => x[0] === v)!; Object.assign(g, { gun: v, gunAdi: r[2], kisa: r[3] }); gun(g); }),
      alan('Başlık', g.baslik, (v) => { g.baslik = v; gun(g); onizle(`etkinlikler:geceler.${i}.baslik`, v); }),
      alan('Saat (isteğe bağlı)', g.saat, (v) => { g.saat = v; gun(g); }, { yer: "20.00'de başlıyor" }),
      alan('Açıklama', g.metin, (v) => { g.metin = v; gun(g); onizle(`etkinlikler:geceler.${i}.metin`, v); }, { tur: 'textarea' }),
      alan('Kampanya etiketi (isteğe bağlı)', g.kampanya, (v) => { g.kampanya = v; gun(g); }),
      gorselAlani(g.afis, (a) => { g.afis = a; gun(g); onizle(`etkinlikler:geceler.${i}.afis`, a); }, 'Afiş (dikey, 9:16)'),
    ), (y) => durum.ayarla('etkinlikler', 'geceler', y, 'Etkinlikler › haftalık geceler'), {
      baslik: (g) => `${g.kisa} · ${g.baslik}`, ekleMetni: '+ Haftalık gece ekle',
      yeni: () => ({ id: `gece-${Date.now().toString(36)}`, gun: '5', gunAdi: 'Her cuma', kisa: 'Cuma', baslik: 'Yeni gece', saat: '', metin: '', kampanya: '', afis: { src: '/posters/karaoke.jpg', alt: 'Afiş' } }),
    }),

    h('h3', { class: 'ara' }, '"Bugün" kutusu (ana sayfa)'),
    not('Boş bırakılan günde hafta içi Social Hour, pazar günü genel bir mesaj gösterilir.'),
    ...bugun.map((d, i) => h('details', { class: 'liste-oge' }, h('summary', {}, h('span', {}, `${d.ad}${d.baslik ? ` · ${d.baslik}` : ''}`)),
      h('div', { class: 'alt-form' },
        alan('Başlık', d.baslik ?? '', (v) => { d.baslik = v || undefined; durum.ayarla('etkinlikler', 'bugun', bugun, 'Etkinlikler › Bugün kutusu'); }),
        alan('Saat', d.saat ?? '', (v) => { d.saat = v || undefined; durum.ayarla('etkinlikler', 'bugun', bugun, 'Etkinlikler › Bugün kutusu'); }),
        alan('Kısa metin', d.kisa ?? '', (v) => { d.kisa = v || undefined; durum.ayarla('etkinlikler', 'bugun', bugun, 'Etkinlikler › Bugün kutusu'); })))),
  );
}

// ===================== SEO =====================
function seoKaydi(yol: string): { dosya: string; onEk: string } {
  const ozel = yol.match(/^\/([a-z0-9-]+)\/$/);
  if (ozel && durum.calisma[`sayfalar/${ozel[1]}`]) return { dosya: `sayfalar/${ozel[1]}`, onEk: 'seo' };
  return { dosya: 'seo', onEk: yol };
}

export function seoPaneli(b: Baglam) {
  const yol = b.sayfaYolu();
  const { dosya, onEk } = seoKaydi(yol);
  const tabanNesne = dosya === 'seo' ? durum.al('seo')?.[onEk] : durum.al(dosya, 'seo');
  if (!tabanNesne) return h('div', {}, baslik('SEO'), not(`Bu sayfa (${yol}) için SEO kaydı yok.`));
  const s = { ...tabanNesne };
  const kaydet = () => {
    if (dosya === 'seo') { const t = kopya(durum.al('seo')); t[onEk] = s; durum.ayarla('seo', '', t, `SEO › ${onEk}`); }
    else durum.ayarla(dosya, 'seo', s, `SEO › ${dosya}`);
    serp();
  };
  const onizleme = h('div', { class: 'serp' });
  const serp = () => onizleme.replaceChildren(
    h('div', { class: 'serp-url' }, `${b.site.replace('https://', '')}${yol === '/' ? '' : yol.replace(/\/$/, '').replace(/\//g, ' › ')}`),
    h('div', { class: 'serp-baslik' }, s.baslik.length > 60 ? s.baslik.slice(0, 58) + '…' : s.baslik),
    h('div', { class: 'serp-aciklama' }, s.aciklama.length > 160 ? s.aciklama.slice(0, 157) + '…' : s.aciklama));
  serp();
  const kapakKutu = h('div', { class: 'kapak' });
  const kapakCiz = () => kapakKutu.replaceChildren(
    h('span', { class: 'alan-ad' }, 'Paylaşım görseli (WhatsApp, Instagram, Google)'),
    h('img', { src: onizlemeSrc(s.kapak), alt: '' }),
    dugme('Değiştir', () => gorselSec((src) => { s.kapak = src; kaydet(); kapakCiz(); })));
  kapakCiz();
  return h('div', {},
    baslik('SEO', `Sayfa: ${yol}`),
    kutu(h('span', { class: 'alan-ad' }, 'Google önizlemesi'), onizleme),
    kutu(
      alan('Sayfa başlığı (title)', s.baslik, (v) => { s.baslik = v; kaydet(); }, { sayac: [30, 60], ipucu: '30–60 karakter. Mekân adı + ne olduğu + semt: "Müjgân Çayyolu · Pub ve Restoran".' }),
      alan('Açıklama (meta description)', s.aciklama, (v) => { s.aciklama = v; kaydet(); }, { tur: 'textarea', sayac: [70, 160], ipucu: '70–160 karakter. Ne sunduğunu, nerede olduğunu ve bir çağrı yaz.' }),
      kapakKutu,
      onay('Arama motorlarında görünsün', s.indeksle !== false, (v) => { s.indeksle = v; kaydet(); }, 'Kapatırsan sayfa "noindex" olur ve site haritasından çıkar.'),
    ),
    kutu(h('span', { class: 'alan-ad' }, 'Sayfa denetimi'), denetim(s)),
    kutu(h('span', { class: 'alan-ad' }, 'Araçlar (yeni sekmede)'),
      h('div', { class: 'baglantilar' },
        h('a', { href: `https://search.google.com/test/rich-results?url=${encodeURIComponent(b.site + yol)}`, target: '_blank', rel: 'noopener' }, 'Zengin sonuç testi (yapısal veri) ↗'),
        h('a', { href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(b.site + yol)}`, target: '_blank', rel: 'noopener' }, 'PageSpeed (hız) ↗'),
        h('a', { href: 'https://search.google.com/search-console', target: '_blank', rel: 'noopener' }, 'Search Console ↗'),
        h('a', { href: `${b.site}/sitemap.xml`, target: '_blank', rel: 'noopener' }, 'Site haritası ↗'))),
    not('Yapısal veri (adres, saatler, menü fiyatları, etkinlik tarihleri) İşletme, Menü ve Etkinlikler panellerindeki bilgilerden otomatik üretilir.'),
  );
}

function denetim(s: { baslik: string; aciklama: string; indeksle?: boolean }) {
  const d = cerceveBelgesi();
  const sonuc: [boolean | 'uyari', string][] = [];
  const tl = s.baslik.length, dl = s.aciklama.length;
  sonuc.push([tl >= 30 && tl <= 60 ? true : 'uyari', `Başlık ${tl} karakter (ideal 30–60)`]);
  sonuc.push([dl >= 70 && dl <= 160 ? true : 'uyari', `Açıklama ${dl} karakter (ideal 70–160)`]);
  if (d?.body) {
    const h1 = d.querySelectorAll('h1').length;
    sonuc.push([h1 === 1, `${h1} adet H1 başlık (tam 1 olmalı)`]);
    const imgs = [...d.querySelectorAll('img')].filter((i) => !i.closest('.brand'));
    const altsiz = imgs.filter((i) => !i.getAttribute('alt')?.trim());
    sonuc.push([altsiz.length === 0, altsiz.length ? `${altsiz.length} görselde alternatif metin yok (görsele tıklayıp ekle)` : `${imgs.length} görselin hepsinde alternatif metin var`]);
    const ld = d.querySelectorAll('script[type="application/ld+json"]').length;
    sonuc.push([ld > 0, `${ld} yapısal veri bloğu`]);
    sonuc.push([!!d.querySelector('link[rel="canonical"]'), 'Kanonik adres tanımlı']);
    const kelime = (d.querySelector('main')?.textContent ?? '').split(/\s+/).filter(Boolean).length;
    sonuc.push([kelime >= 150 ? true : 'uyari', `Sayfada ${kelime} kelime metin${kelime < 150 ? ' (az; kısa bir tanıtım paragrafı eklemek yardımcı olur)' : ''}`]);
    const metin = (d.querySelector('main')?.textContent ?? '').toLocaleLowerCase('tr');
    sonuc.push([metin.includes('çayyolu') ? true : 'uyari', metin.includes('çayyolu') ? 'Sayfada "Çayyolu" geçiyor (yerel arama)' : 'Sayfada "Çayyolu" geçmiyor (yerel aramada yardımcı olur)']);
  }
  if (s.indeksle === false) sonuc.push(['uyari', 'Sayfa arama motorlarına kapalı']);
  return h('ul', { class: 'denetim' }, ...sonuc.map(([ok, m]) => h('li', { class: ok === true ? 'iyi' : ok === 'uyari' ? 'uyari' : 'hata' }, m)));
}

// ===================== Sayfalar =====================
const SABIT = [['/', 'Ana sayfa'], ['/menu/', 'Menü'], ['/etkinlikler/', 'Etkinlikler']];
const AYRILMIS = new Set(['admin', 'menu', 'etkinlikler', 'kvkk', 'img', 'posters', 'fonts', '_astro', 'sitemap', 'robots', 'favicon']);
const BLOK_ADI: Record<string, string> = { kapak: 'Kapak (büyük görsel + başlık)', metin: 'Metin', 'gorsel-metin': 'Görsel + metin', galeri: 'Galeri', cagri: 'Çağrı (buton)' };

export const yeniBlok = (tur: string, b?: string): any => ({
  kapak: { tur: 'kapak', baslik: b ?? 'Sayfa başlığı', metin: 'Kısa bir giriş cümlesi.', gorsel: { src: '/img/hgp-6015.jpg', alt: '' } },
  metin: { tur: 'metin', baslik: 'Başlık', metin: '<p>Metnini buraya yaz.</p>' },
  'gorsel-metin': { tur: 'gorsel-metin', baslik: 'Başlık', metin: '<p>Metnini buraya yaz.</p>', gorsel: { src: '/img/dsc06657.jpg', alt: '' } },
  galeri: { tur: 'galeri', baslik: 'Galeri', gorseller: [{ src: '/img/hgp-6059.jpg', alt: '' }, { src: '/img/a3.jpg', alt: '' }, { src: '/img/dsc06717.jpg', alt: '' }] },
  cagri: { tur: 'cagri', baslik: 'Masanı ayırt', metin: '', buton: { metin: 'Rezervasyon', link: 'https://ig.me/m/mujganthepub' } },
}[tur]);

const SABLON: Record<string, [string, string[]]> = {
  basit: ['Basit sayfa (kapak, metin, çağrı)', ['kapak', 'metin', 'cagri']],
  duyuru: ['Etkinlik / duyuru (kapak, görsel+metin, çağrı)', ['kapak', 'gorsel-metin', 'cagri']],
  galeri: ['Galeri (kapak, galeri)', ['kapak', 'galeri']],
  bos: ['Boş (yalnızca kapak)', ['kapak']],
};

/** Sayfalar panelinde düzenlenen özel sayfa (yayınlanmamış yeni sayfalar önizlemeye açılmaz) */
let secilenOzel: string | null = null;

export function sayfalarPaneli(b: Baglam) {
  const ozel = Object.keys(durum.calisma).filter((k) => k.startsWith('sayfalar/') && !durum.silinenler.has(k));
  const su = b.sayfaYolu();
  const aktif = su.match(/^\/([a-z0-9-]+)\/$/)?.[1];
  const yoldan = aktif && durum.calisma[`sayfalar/${aktif}`] ? `sayfalar/${aktif}` : null;
  const aktifDosya = secilenOzel && durum.calisma[secilenOzel] && !durum.silinenler.has(secilenOzel) ? secilenOzel : yoldan;
  const ozelAc = (k: string) => {
    secilenOzel = k;
    if (durum.yeniDosyalar.has(k)) b.panelAc('sayfalar'); else b.git(`/${k.slice(9)}/`);
  };

  // Yeni sayfa formu
  const yeni = { baslik: '', slug: '', sablon: 'basit', menu: false };
  let slugElle = false;
  const slugGirdi = h('input', { placeholder: 'adres', on: { input: (e: any) => { slugElle = true; yeni.slug = slugla(e.target.value); } } });
  const form = h('div', { class: 'alt-form' },
    alan('Sayfa adı', '', (v) => { yeni.baslik = v; if (!slugElle) { yeni.slug = slugla(v); slugGirdi.value = yeni.slug; } }, { yer: 'Yılbaşı Gecesi' }),
    h('label', { class: 'alan' }, h('span', { class: 'alan-ad' }, 'Adres'), h('div', { class: 'onek' }, h('span', {}, `${b.site.replace('https://', '')}/`), slugGirdi)),
    secim('Şablon', yeni.sablon, Object.entries(SABLON).map(([k, [a]]) => [k, a]), (v) => (yeni.sablon = v)),
    onay('Üst menüde göster', false, (v) => (yeni.menu = v)),
    dugme('Sayfayı oluştur', () => {
      const slug = slugla(yeni.slug || yeni.baslik);
      if (!yeni.baslik.trim() || !slug) return bildirim('Sayfa adı yaz.', 'hata');
      if (AYRILMIS.has(slug) || durum.calisma[`sayfalar/${slug}`]) return bildirim('Bu adres kullanılıyor, başka bir adres seç.', 'hata');
      durum.yeniDosya(`sayfalar/${slug}`, {
        baslik: yeni.baslik.trim(), menudeGoster: yeni.menu,
        seo: { baslik: `${yeni.baslik.trim()} · Müjgân Çayyolu`, aciklama: '', kapak: '/img/hgp-6015.jpg', indeksle: true },
        bloklar: SABLON[yeni.sablon][1].map((t) => yeniBlok(t, yeni.baslik.trim())),
      }, `Yeni sayfa: /${slug}/`);
      bildirim(`/${slug}/ oluşturuldu. İçeriği buradan düzenle, sonra Yayınla.`, 'ok');
      secilenOzel = `sayfalar/${slug}`;
      b.panelAc('sayfalar');
    }, 'ana'));

  return h('div', {},
    baslik('Sayfalar', 'Sayfalar arasında geçiş, yeni sayfa ve blok düzeni.'),
    kutu(h('span', { class: 'alan-ad' }, 'Sitedeki sayfalar'),
      h('ul', { class: 'sayfa-liste' },
        ...SABIT.map(([y, a]) => h('li', { class: !aktifDosya && su === y ? 'aktif' : '' }, h('button', { type: 'button', on: { click: () => { secilenOzel = null; b.git(y); } } }, a), h('code', {}, y))),
        ...ozel.map((k) => { const y = `/${k.slice(9)}/`; const yeniMi = durum.yeniDosyalar.has(k);
          return h('li', { class: aktifDosya === k ? 'aktif' : '' }, h('button', { type: 'button', on: { click: () => ozelAc(k) } }, durum.calisma[k].baslik), h('code', {}, y), yeniMi ? h('span', { class: 'rozet' }, 'yayınlanmadı') : ''); }))),
    aktifDosya ? ozelSayfaDuzenleyici(aktifDosya, b) : '',
    kutu(h('span', { class: 'alan-ad' }, 'Yeni sayfa'), form),
  );
}

function ozelSayfaDuzenleyici(dosya: string, b: Baglam) {
  const p = kopya(durum.calisma[dosya]);
  const yeniMi = durum.yeniDosyalar.has(dosya);
  const kaydet = (et: string) => durum.ayarla(dosya, '', p, et);
  let eklenecek = 'metin';
  return kutu(
    h('span', { class: 'alan-ad' }, `Bu sayfa: /${dosya.slice(9)}/`),
    yeniMi ? not('Yeni sayfa, yayınladıktan sonra önizlemede açılır. Şimdilik içeriği buradan düzenle.') : '',
    alan('Sayfa adı (menüde ve sayfa yolunda görünür)', p.baslik, (v) => { p.baslik = v; kaydet('Sayfa adı'); }),
    onay('Üst menüde göster', !!p.menudeGoster, (v) => { p.menudeGoster = v; kaydet('Üst menüde göster'); }),
    h('details', { class: 'ic' }, h('summary', {}, 'SEO (Google başlığı ve açıklaması)'),
      h('div', { class: 'alt-form' },
        alan('Sayfa başlığı (title)', p.seo.baslik, (v) => { p.seo.baslik = v; kaydet('SEO başlığı'); }, { sayac: [30, 60] }),
        alan('Açıklama', p.seo.aciklama, (v) => { p.seo.aciklama = v; kaydet('SEO açıklaması'); }, { tur: 'textarea', sayac: [70, 160], ipucu: 'Boş kalırsa Google sayfadaki metinden kendisi seçer.' }),
        onay('Arama motorlarında görünsün', p.seo.indeksle !== false, (v) => { p.seo.indeksle = v; kaydet('SEO görünürlük'); }))),
    h('h4', {}, 'Bloklar'),
    liste(p.bloklar, (bl: any, i, g) => blokFormu(bl, (y) => g(y), `${dosya}:bloklar.${i}`), (y) => { p.bloklar = y; kaydet('Bloklar'); },
      { baslik: (bl: any) => `${BLOK_ADI[bl.tur] ?? bl.tur}${bl.baslik ? ` · ${bl.baslik}` : ''}` }),
    h('div', { class: 'satir' },
      secim('', eklenecek, Object.entries(BLOK_ADI), (v) => (eklenecek = v)),
      dugme('+ Blok ekle', () => { p.bloklar.push(yeniBlok(eklenecek)); kaydet('Blok eklendi'); b.panelAc('sayfalar'); })),
    dugme('Bu sayfayı sil', () => {
      if (!confirm(`/${dosya.slice(9)}/ sayfası silinsin mi? Yayınlayınca siteden kalkar.`)) return;
      durum.dosyaSil(dosya, `Sayfa silindi: /${dosya.slice(9)}/`); secilenOzel = null; if (b.sayfaYolu() === `/${dosya.slice(9)}/`) b.git('/'); else b.panelAc('sayfalar');
    }, 'tehlike'),
  );
}

function blokFormu(bl: any, g: (y: any) => void, yol: string) {
  const c = (k: string, v: any) => { bl[k] = v; g(bl); onizle(`${yol}.${k}`, v); };
  const f = h('div', { class: 'alt-form' });
  if ('ust' in bl || ['metin', 'gorsel-metin'].includes(bl.tur)) f.append(alan('Üst etiket (isteğe bağlı)', bl.ust ?? '', (v) => c('ust', v || undefined)));
  if (bl.tur !== 'galeri' || 'baslik' in bl) f.append(alan('Başlık', bl.baslik ?? '', (v) => c('baslik', v)));
  if (bl.tur === 'kapak' || bl.tur === 'cagri') f.append(alan('Metin', bl.metin ?? '', (v) => c('metin', v), { tur: 'textarea' }));
  if (bl.tur === 'metin' || bl.tur === 'gorsel-metin') f.append(alan('Metin', bl.metin ?? '', (v) => c('metin', temizHtml(v)), { tur: 'textarea', ipucu: 'Paragraf: <p>…</p>, vurgu: <em>…</em>, kalın: <strong>…</strong>, bağlantı: <a href="/menu/">…</a>' }));
  if (bl.gorsel) f.append(gorselAlani(bl.gorsel, (v) => c('gorsel', v)));
  if (bl.tur === 'gorsel-metin') f.append(onay('Görsel sağda', !!bl.ters, (v) => c('ters', v)));
  if (bl.tur === 'cagri') {
    f.append(alan('Buton yazısı', bl.buton.metin, (v) => c('buton', { ...bl.buton, metin: v })), alan('Buton bağlantısı', bl.buton.link, (v) => c('buton', { ...bl.buton, link: v }), { tur: 'url' }));
  }
  if (bl.tur === 'galeri') f.append(liste(bl.gorseller, (x: any, i, gg) => gorselAlani(x, (v) => gg(v), `${i + 1}. görsel`), (y) => c('gorseller', y),
    { yeni: () => ({ src: '/img/hgp-6015.jpg', alt: '' }), ekleMetni: '+ Görsel ekle' }));
  return f;
}

// ===================== İşletme =====================
export function isletmePaneli() {
  const i = kopya(durum.al('isletme'));
  if (!i) return not('İşletme dosyası yüklenemedi.');
  const k = (yol: string, et: string) => (v: any) => { durum.ayarla('isletme', yol, v, `İşletme › ${et}`); onizle(`isletme:${yol}`, v); };
  return h('div', {},
    baslik('İşletme bilgileri', 'Adres, telefon, saatler, rezervasyon ve paket servis. Google için yapısal veri bu bilgilerden üretilir.'),
    kutu(h('span', { class: 'alan-ad' }, 'İletişim ve rezervasyon'),
      alan('WhatsApp numarası (rezervasyon)', i.whatsapp, k('whatsapp', 'WhatsApp'), { tur: 'tel', yer: '0536 123 45 67', ipucu: 'Sitede bu yazıldığı gibi görünür (0536 … ya da +90 536 … olabilir). Doluysa tüm "Rezervasyon" düğmeleri WhatsApp düğmesine döner; boşsa Instagram mesajına gider.' }),
      alan('Telefon (sitede görünür)', i.telefon, k('telefon', 'Telefon'), { tur: 'tel', yer: '0312 123 45 67' }),
      alan('Instagram kullanıcı adı', i.instagram.kullanici, (v) => { const u = v.replace(/^@/, ''); durum.ayarla('isletme', 'instagram', { kullanici: u, url: `https://www.instagram.com/${u}/`, dm: `https://ig.me/m/${u}` }, 'İşletme › Instagram'); })),
    kutu(h('span', { class: 'alan-ad' }, 'Saatler'),
      alan('Sitede görünen saat', i.saatler.acik, k('saatler.acik', 'saatler'), { yer: '10.30 – 01.00' }),
      h('div', { class: 'iki' }, alan('Açılış (Google için)', i.saatler.acilis, k('saatler.acilis', 'açılış'), { tur: 'time' }), alan('Kapanış', i.saatler.kapanis, k('saatler.kapanis', 'kapanış'), { tur: 'time' })),
      alan('Mutfak', i.saatler.mutfak, k('saatler.mutfak', 'mutfak'))),
    kutu(h('span', { class: 'alan-ad' }, 'Adres'),
      alan('Sokak / no', i.adres.sokak, k('adres.sokak', 'adres')),
      h('div', { class: 'iki' }, alan('Mekân', i.adres.mekan, k('adres.mekan', 'mekân')), alan('Posta kodu', i.adres.postaKodu, k('adres.postaKodu', 'posta kodu'))),
      h('div', { class: 'iki' }, alan('İlçe', i.adres.ilce, k('adres.ilce', 'ilçe')), alan('İl', i.adres.il, k('adres.il', 'il'))),
      ...i.adres.satirlar.map((s: string, n: number) => alan(`Ulaşım bölümündeki ${n + 1}. satır`, s, k(`adres.satirlar.${n}`, 'adres satırı'))),
      alan('Google Haritalar linki', i.haritaLinki, k('haritaLinki', 'harita'), { tur: 'url' }),
      alan('AVM içinde giriş tarifi', i.girisTarifi, k('girisTarifi', 'giriş tarifi'), { tur: 'textarea', yer: 'Otopark -1. kattan asansörle zemin kata…' })),
    kutu(h('span', { class: 'alan-ad' }, 'Paket servis platformları'),
      not('Link girilince ana sayfadaki paket servis kutusu görünür.'),
      liste(i.siparisPlatformlari as { ad: string; url: string }[], (p, n, g) => h('div', { class: 'alt-form' },
        alan('Platform', p.ad, (v) => { p.ad = v; g(p); }, { yer: 'Yemeksepeti' }), alan('Mağaza linki', p.url, (v) => { p.url = v; g(p); }, { tur: 'url' })),
      (y) => durum.ayarla('isletme', 'siparisPlatformlari', y, 'İşletme › paket servis'), { yeni: () => ({ ad: '', url: '' }), ekleMetni: '+ Platform ekle', baslik: (p) => p.ad || 'Yeni platform', acik: true })),
    kutu(onay('Site yayında (arama motorlarına açık)', i.yayinda, k('yayinda', 'yayın durumu'), 'Kapatırsan site "taslak" olur: arama motorlarına kapanır ve eksik bilgiler [DOLDURULACAK] olarak görünür.')),
  );
}

// ===================== Değişiklikler =====================
const kisalt = (v: unknown) => {
  const s = typeof v === 'string' ? v.replace(/<[^>]+>/g, '') : v && typeof v === 'object' && 'src' in (v as any) ? `görsel: ${(v as any).src.split('/').pop()}` : JSON.stringify(v);
  return (s ?? '—').length > 70 ? s!.slice(0, 68) + '…' : s ?? '—';
};

export function degisikliklerPaneli(b: Baglam) {
  const mesaj = h('input', { placeholder: 'Ne değişti? (isteğe bağlı)', value: '' });
  return h('div', {},
    baslik('Değişiklikler', durum.bekleyenSayisi ? `${durum.bekleyenSayisi} değişiklik yayın bekliyor.` : 'Yayın bekleyen değişiklik yok.'),
    durum.bekleyenSayisi ? kutu(
      h('ol', { class: 'degisiklik' }, ...durum.degisiklikler.map((d, i) => h('li', {},
        h('div', {}, h('b', {}, d.etiket), h('div', { class: 'once-sonra' }, h('del', {}, kisalt(d.once)), ' → ', h('ins', {}, kisalt(d.sonra)))),
        h('button', { type: 'button', class: 'geri', title: 'Geri al', on: { click: () => { durum.geriAl(i); b.panelAc('degisiklikler'); } } }, 'Geri al')))),
      durum.yuklemeler.length ? not(`${durum.yuklemeler.length} yeni görsel yüklenecek (web boyutuna küçültüldü).`) : '',
      h('label', { class: 'alan' }, h('span', { class: 'alan-ad' }, 'Not'), mesaj),
      h('div', { class: 'satir' },
        dugme('Yayınla', () => b.yayinla(mesaj.value.trim()), 'ana buyuk'),
        dugme('Tümünü at', () => { if (confirm('Yayınlanmamış tüm değişiklikler silinsin mi?')) { durum.tumunuAt(); location.reload(); } }, 'tehlike')),
      not('Yayınla, değişiklikleri GitHub\'a kaydeder; site 1–2 dakika içinde güncellenir.'),
    ) : '',
  );
}

export { alaniCiz };
