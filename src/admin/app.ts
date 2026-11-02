// /admin — giriş, kurulum ve düzenleyici kabuğu.
import { ac, kilitle, type Kasa } from './kasa';
import { GitHub, GitHubHata, DEPO } from './github';
import { durum } from './durum';
import { h, bildirim, alan, dugme } from './ui';
import * as secici from './secici';
import * as P from './paneller';

const SITE = 'https://mujganthepub.com';
const OTURUM = 'mj-cms-oturum';
const KASA_YOLU = 'public/admin/kasa.json';
const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

let gh: GitHub;
let token = '';
let sekme = 'oge';
let sonSecim: secici.Secim | null = null;
let iframe: HTMLIFrameElement;

// ---------------- Oturum ----------------
function oturumAl(): string | null {
  try {
    const o = JSON.parse(sessionStorage.getItem(OTURUM) || 'null');
    if (o && o.son > Date.now()) return o.t;
  } catch { /* yok */ }
  return null;
}
function oturumKaydet(t: string) { try { sessionStorage.setItem(OTURUM, JSON.stringify({ t, son: Date.now() + 12 * 3600e3 })); } catch { /* yok */ } }
function cikis() { try { sessionStorage.removeItem(OTURUM); } catch { /* yok */ } location.reload(); }

async function kasaGetir(): Promise<Kasa | null> {
  const r = await fetch(`/admin/kasa.json?v=${Date.now()}`, { cache: 'no-store' });
  if (!r.ok) return null;
  try { return await r.json(); } catch { return null; }
}

function ekran(ad: 'giris' | 'kurulum' | 'yukleniyor' | 'uygulama') {
  for (const e of ['giris', 'kurulum', 'yukleniyor', 'uygulama']) $(`#${e}`).hidden = e !== ad;
}

async function basla() {
  const t = oturumAl();
  if (t) { token = t; return uygulamayiAc(); }
  const kasa = await kasaGetir();
  if (!kasa) { ekran('kurulum'); kurulumFormu(); return; }
  ekran('giris');
  const form = $<HTMLFormElement>('#giris form');
  const sifre = $<HTMLInputElement>('#sifre');
  const hata = $('#giris-hata');
  sifre.focus();
  form.onsubmit = async (e) => {
    e.preventDefault();
    hata.textContent = ''; form.classList.add('bekliyor');
    try {
      token = await ac(kasa, sifre.value);
      oturumKaydet(token);
      await uygulamayiAc();
    } catch {
      await new Promise((r) => setTimeout(r, 800));
      hata.textContent = 'Şifre yanlış.';
      sifre.select();
    } finally { form.classList.remove('bekliyor'); }
  };
}

function kurulumFormu() {
  const form = $<HTMLFormElement>('#kurulum form');
  const hata = $('#kurulum-hata');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const t = $<HTMLInputElement>('#k-token').value.trim();
    const s1 = $<HTMLInputElement>('#k-sifre').value, s2 = $<HTMLInputElement>('#k-sifre2').value;
    hata.textContent = '';
    if (s1.length < 12) { hata.textContent = 'Şifre en az 12 karakter olmalı.'; return; }
    if (s1 !== s2) { hata.textContent = 'Şifreler aynı değil.'; return; }
    form.classList.add('bekliyor');
    try {
      const g = new GitHub(t);
      const d = await g.depo();
      if (!d.permissions?.push) throw new Error('Bu anahtarın depoya yazma izni yok (Contents: Read and write).');
      const kasa = await kilitle(t, s1);
      await g.commit('CMS: giriş kasası oluşturuldu', [{ yol: KASA_YOLU, metin: JSON.stringify(kasa, null, 2) + '\n' }]);
      token = t; oturumKaydet(t);
      bildirim('Kurulum tamam. Şifren artık bu panelin anahtarı.', 'ok');
      await uygulamayiAc();
    } catch (err) {
      hata.textContent = err instanceof GitHubHata && err.durum === 401 ? 'Anahtar geçersiz.' : (err as Error).message;
    } finally { form.classList.remove('bekliyor'); }
  };
}

// ---------------- Düzenleyici ----------------
async function uygulamayiAc() {
  ekran('yukleniyor');
  gh = new GitHub(token);
  try {
    await durum.yukle(gh);
  } catch (e) {
    if (e instanceof GitHubHata && e.durum === 401) { bildirim('Erişim anahtarının süresi dolmuş ya da iptal edilmiş. Ayarlar\'dan yenile.', 'hata'); }
    else bildirim(`İçerik yüklenemedi: ${(e as Error).message}`, 'hata');
    try { sessionStorage.removeItem(OTURUM); } catch { /* yok */ }
    ekran('giris');
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
  $('#ayarlar').onclick = ayarlar;
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
    bildirim(`Yayınlanamadı: ${(e as Error).message}`, 'hata');
  } finally { yayinda = false; }
}

// ---------------- Ayarlar ----------------
function ayarlar() {
  const v = { yeniToken: '', s1: '', s2: '' };
  const hata = h('p', { class: 'hata', role: 'alert' });
  const kapat = () => m.remove();
  const m = h('div', { class: 'modal', on: { click: (e: Event) => { if (e.target === m) kapat(); } } },
    h('div', { class: 'modal-ic dar' },
      h('div', { class: 'modal-bas' }, h('b', {}, 'Ayarlar'), dugme('Kapat', kapat)),
      h('p', { class: 'not' }, 'Şifreyi değiştirince eski şifre bir sonraki yayından sonra çalışmaz. Yeni erişim anahtarı (GitHub) girmek isteğe bağlı.'),
      alan('Yeni şifre (en az 12 karakter)', '', (x) => (v.s1 = x), { tur: 'text' }),
      alan('Yeni şifre (tekrar)', '', (x) => (v.s2 = x), { tur: 'text' }),
      alan('Yeni GitHub erişim anahtarı (isteğe bağlı)', '', (x) => (v.yeniToken = x.trim()), { tur: 'text', ipucu: 'Anahtarın süresi dolduysa yenisini buraya yapıştır.' }),
      hata,
      dugme('Kaydet', async () => {
        hata.textContent = '';
        if (v.s1.length < 12) { hata.textContent = 'Şifre en az 12 karakter olmalı.'; return; }
        if (v.s1 !== v.s2) { hata.textContent = 'Şifreler aynı değil.'; return; }
        try {
          const t = v.yeniToken || token;
          if (v.yeniToken) { const d = await new GitHub(t).depo(); if (!d.permissions?.push) throw new Error('Anahtarın yazma izni yok.'); }
          const kasa = await kilitle(t, v.s1);
          await new GitHub(t).commit('CMS: giriş şifresi güncellendi', [{ yol: KASA_YOLU, metin: JSON.stringify(kasa, null, 2) + '\n' }]);
          token = t; gh = new GitHub(t); durum.gh = gh; oturumKaydet(t);
          bildirim('Şifre güncellendi.', 'ok'); kapat();
        } catch (e) { hata.textContent = (e as Error).message; }
      }, 'ana'),
      h('p', { class: 'not' }, `Depo: ${DEPO.sahip}/${DEPO.ad}`)));
  m.querySelectorAll('input').forEach((i) => { if (i.closest('label')?.textContent?.includes('şifre')) i.type = 'password'; });
  document.body.append(m);
}

basla().catch((e) => { ekran('giris'); bildirim((e as Error).message, 'hata'); });
