// /admin — e-postayla sihirli bağlantı girişi ve düzenleyici kabuğu.
import { GitHub, GitHubHata, sunucu } from './github';
import { SUNUCU } from './ayar';
import { durum } from './durum';
import { h, bildirim } from './ui';
import * as secici from './secici';
import * as P from './paneller';

const SITE = 'https://mujganthepub.com';
const OTURUM = 'mj-cms-oturum';
const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

let gh: GitHub;
let eposta = '';
let sekme = 'oge';
let sonSecim: secici.Secim | null = null;
let iframe: HTMLIFrameElement;

// ---------------- Oturum ----------------
type Oturum = { oturum: string; eposta: string; son: number };
function oturumAl(): Oturum | null {
  try {
    const o = JSON.parse(localStorage.getItem(OTURUM) || 'null');
    if (o && o.son > Date.now() + 60e3) return o;
  } catch { /* yok */ }
  return null;
}
function oturumKaydet(o: Oturum) { try { localStorage.setItem(OTURUM, JSON.stringify(o)); } catch { /* yok */ } }
function oturumSil() { try { localStorage.removeItem(OTURUM); } catch { /* yok */ } }
function cikis() { oturumSil(); location.replace('/admin/'); }

function ekran(ad: 'giris' | 'kurulum' | 'yukleniyor' | 'uygulama') {
  for (const e of ['giris', 'kurulum', 'yukleniyor', 'uygulama']) $(`#${e}`).hidden = e !== ad;
}

async function basla() {
  if (!SUNUCU) { ekran('kurulum'); return; }
  // E-postadaki bağlantıdan gelindi mi?
  const kod = location.hash.match(/giris=([0-9a-f]{64})/)?.[1];
  if (kod) {
    history.replaceState(null, '', location.pathname);
    ekran('yukleniyor');
    $('#yukleniyor p').textContent = 'Giriş doğrulanıyor…';
    try {
      const r = await sunucu<{ oturum?: string; eposta?: string; son?: number }>('dogrula', { kod });
      if (r.durum !== 200 || !r.oturum) throw new Error(r.hata || 'Bağlantı geçersiz.');
      oturumKaydet({ oturum: r.oturum, eposta: r.eposta!, son: r.son! });
    } catch (e) {
      girisFormu((e as Error).message);
      return;
    }
  }
  const o = oturumAl();
  if (o) return uygulamayiAc(o);
  girisFormu();
}

function girisFormu(hataMetni = '') {
  ekran('giris');
  const form = $<HTMLFormElement>('#giris form');
  const girdi = $<HTMLInputElement>('#eposta');
  const hata = $('#giris-hata');
  const gonderildi = $('#giris-gonderildi');
  hata.textContent = hataMetni;
  try { girdi.value = localStorage.getItem('mj-cms-son-eposta') || ''; } catch { /* yok */ }
  girdi.focus();
  form.onsubmit = async (e) => {
    e.preventDefault();
    const adres = girdi.value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adres)) { hata.textContent = 'Geçerli bir e-posta adresi yaz.'; return; }
    hata.textContent = ''; form.classList.add('bekliyor');
    try {
      const r = await sunucu('link', { eposta: adres });
      if (r.durum !== 200) throw new Error(r.hata || 'Gönderilemedi.');
      try { localStorage.setItem('mj-cms-son-eposta', adres); } catch { /* yok */ }
      form.hidden = true;
      gonderildi.hidden = false;
      $('#gonderilen-adres').textContent = adres;
    } catch (err) {
      hata.textContent = (err as Error).message;
    } finally { form.classList.remove('bekliyor'); }
  };
  $('#yeniden').onclick = () => { gonderildi.hidden = true; form.hidden = false; girdi.focus(); };
}

// ---------------- Düzenleyici ----------------
async function uygulamayiAc(o: Oturum) {
  ekran('yukleniyor');
  $('#yukleniyor p').textContent = 'İçerik yükleniyor…';
  eposta = o.eposta;
  gh = new GitHub(o.oturum);
  try {
    await durum.yukle(gh);
  } catch (e) {
    if (e instanceof GitHubHata && e.durum === 401) { oturumSil(); girisFormu('Oturumun süresi dolmuş. Yeni giriş bağlantısı iste.'); return; }
    girisFormu(`İçerik yüklenemedi: ${(e as Error).message}`);
    return;
  }
  ekran('uygulama');
  iframe = $<HTMLIFrameElement>('#onizleme');
  secici.baslat(iframe, (s) => { sonSecim = s; if (s) sekmeAc('oge'); else if (sekme === 'oge') ciz(); });
  iframe.addEventListener('load', () => {
    sayfaSeciciGuncelle();
    if (['seo', 'sayfalar'].includes(sekme)) ciz();
  });
  iframe.src = '/';
  ustCubuk();
  durum.dinle(rozetGuncelle);
  rozetGuncelle();
  sekmeAc('oge');
  if (durum.taslakVar) bildirim(`Yayınlanmamış ${durum.bekleyenSayisi} değişikliğin geri yüklendi.`, 'bilgi');
}

const baglam: P.Baglam = {
  site: SITE,
  sayfaYolu: () => { try { return iframe.contentWindow!.location.pathname || '/'; } catch { return '/'; } },
  git: (yol) => { secici.sec(null); iframe.src = yol; },
  panelAc: (ad) => sekmeAc(ad),
  yayinla: (m) => yayinla(m),
};

const SEKMELER: [string, string][] = [['oge', 'Öğe'], ['menu', 'Menü'], ['etkinlikler', 'Etkinlikler'], ['seo', 'SEO'], ['sayfalar', 'Sayfalar'], ['isletme', 'İşletme'], ['degisiklikler', 'Değişiklikler']];

function sekmeAc(ad: string) {
  sekme = ad;
  $('#sekmeler').replaceChildren(...SEKMELER.map(([k, a]) =>
    h('button', { type: 'button', class: k === ad ? 'aktif' : '', 'aria-pressed': k === ad, on: { click: () => sekmeAc(k) } },
      a, k === 'degisiklikler' && durum.bekleyenSayisi ? h('span', { class: 'sayi' }, String(durum.bekleyenSayisi)) : '')));
  ciz();
}

function ciz() {
  const p = $('#panel');
  const icerik =
    sekme === 'oge' ? P.ogePaneli(sonSecim, baglam)
    : sekme === 'menu' ? P.menuPaneli(baglam)
    : sekme === 'etkinlikler' ? P.etkinlikPaneli(baglam)
    : sekme === 'seo' ? P.seoPaneli(baglam)
    : sekme === 'sayfalar' ? P.sayfalarPaneli(baglam)
    : sekme === 'isletme' ? P.isletmePaneli()
    : P.degisikliklerPaneli(baglam);
  p.replaceChildren(icerik);
  p.scrollTop = 0;
}

function rozetGuncelle() {
  const n = durum.bekleyenSayisi;
  $('#bekleyen').textContent = n ? `${n} değişiklik` : 'Değişiklik yok';
  $<HTMLButtonElement>('#yayinla').disabled = !n;
  const s = document.querySelector('#sekmeler button:last-child');
  if (s) { s.querySelector('.sayi')?.remove(); if (n) s.append(h('span', { class: 'sayi' }, String(n))); }
}

function sayfaSeciciGuncelle() {
  const sel = $<HTMLSelectElement>('#sayfa-sec');
  const su = baglam.sayfaYolu();
  const ozel = Object.keys(durum.calisma).filter((k) => k.startsWith('sayfalar/')).map((k) => [`/${k.slice(9)}/`, durum.calisma[k].baslik]);
  const tum = [['/', 'Ana sayfa'], ['/menu/', 'Menü'], ['/etkinlikler/', 'Etkinlikler'], ...ozel];
  if (!tum.some(([y]) => y === su)) tum.push([su, su]);
  sel.replaceChildren(...tum.map(([y, a]) => h('option', { value: y, selected: y === su }, a)));
}

function ustCubuk() {
  $<HTMLSelectElement>('#sayfa-sec').onchange = (e) => baglam.git((e.target as HTMLSelectElement).value);
  const mod = $<HTMLButtonElement>('#mod');
  let secMod = true;
  mod.onclick = () => {
    secMod = !secMod; secici.modAyarla(secMod);
    mod.textContent = secMod ? 'Seç' : 'Gezin';
    mod.classList.toggle('aktif', secMod);
    mod.title = secMod ? 'Öğelere tıklayıp düzenle' : 'Bağlantılara tıklayıp sayfalar arasında gez';
  };
  document.querySelectorAll<HTMLButtonElement>('[data-cihaz]').forEach((b) => (b.onclick = () => {
    $('#cerceve').dataset.cihaz = b.dataset.cihaz!;
    document.querySelectorAll('[data-cihaz]').forEach((x) => x.classList.toggle('aktif', x === b));
  }));
  $('#yenile').onclick = () => { iframe.src = baglam.sayfaYolu() + `?v=${Date.now()}`; };
  $('#siteyi-ac').onclick = () => window.open(SITE + baglam.sayfaYolu(), '_blank', 'noopener');
  $('#bekleyen').onclick = () => sekmeAc('degisiklikler');
  $('#yayinla').onclick = () => sekmeAc('degisiklikler');
  $('#cikis').onclick = () => { if (!durum.bekleyenSayisi || confirm('Yayınlanmamış değişiklikler bu tarayıcıda saklı kalacak. Çıkılsın mı?')) cikis(); };
  $('#kim').textContent = eposta;
}

// ---------------- Yayın ----------------
let yayinda = false;
async function yayinla(mesaj: string) {
  if (yayinda || !durum.bekleyenSayisi) return;
  yayinda = true;
  const durumYaz = (m: string, tur = '') => { const e = $('#yayin-durumu'); e.textContent = m; e.className = `yayin-durumu ${tur}`; e.hidden = !m; };
  try {
    durumYaz('Kontrol ediliyor…', 'calisiyor');
    const cakisan = await durum.cakismaVarMi();
    if (cakisan.length) {
      durumYaz('');
      bildirim(`Bu dosyalar sen çalışırken başka yerden değişti: ${cakisan.join(', ')}. Değişikliklerini not al, sayfayı yenileyip yeniden yap.`, 'hata');
      return;
    }
    const ozet = durum.degisiklikler.slice(0, 6).map((d) => `- ${d.etiket}`).join('\n') + (durum.degisiklikler.length > 6 ? `\n- … (+${durum.degisiklikler.length - 6})` : '');
    durumYaz('Kaydediliyor…', 'calisiyor');
    const sha = await gh.commit(`CMS: ${mesaj || 'içerik güncellendi'}\n\n${ozet}`, durum.paket());
    await durum.yukle(gh);
    sekmeAc(sekme === 'degisiklikler' ? 'oge' : sekme);
    durumYaz('Yayınlanıyor… (1–2 dk)', 'calisiyor');
    bildirim('Kaydedildi. Site güncelleniyor.', 'ok');
    const bas = Date.now();
    while (Date.now() - bas < 6 * 60e3) {
      await new Promise((r) => setTimeout(r, 6000));
      const r = await gh.yayinDurumu(sha).catch(() => null);
      if (r?.status === 'completed') {
        if (r.conclusion === 'success') {
          durumYaz('Yayında ✓', 'iyi');
          bildirim('Değişiklikler sitede yayında.', 'ok');
          iframe.src = baglam.sayfaYolu() + `?v=${Date.now()}`;
          setTimeout(() => durumYaz(''), 8000);
        } else {
          durumYaz('Yayın hatası', 'hata');
          bildirim('Site derlenirken hata oldu. Değişiklikler kaydedildi ama yayına çıkmadı; GitHub Actions sayfasına bak.', 'hata');
        }
        return;
      }
    }
    durumYaz('Yayın uzun sürüyor', 'uyari');
  } catch (e) {
    durumYaz('Hata', 'hata');
    if (e instanceof GitHubHata && e.durum === 401) { bildirim('Oturumun süresi doldu. Değişikliklerin bu tarayıcıda saklı; yeniden giriş yapınca yayınlayabilirsin.', 'hata'); setTimeout(cikis, 2500); return; }
    bildirim(`Yayınlanamadı: ${(e as Error).message}`, 'hata');
  } finally { yayinda = false; }
}

// Bağlantı, panel açıkken aynı sekmede açılırsa da girişi yap
window.addEventListener('hashchange', () => { if (/giris=/.test(location.hash)) location.reload(); });
basla().catch((e) => girisFormu((e as Error).message));
