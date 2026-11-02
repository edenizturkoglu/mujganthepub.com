// CMS durumu: GitHub'dan yüklenen içerik dosyaları, üzerinde çalışılan kopyalar, bekleyen değişiklikler.
import { GitHub } from './github';
import { oku, yaz, kopya } from './yol';

export type Degisiklik = { dosya: string; yol: string; once: unknown; sonra: unknown; etiket: string };
export type Yukleme = { yol: string; src: string; base64: string; onizleme: string };

const ICERIK = 'src/icerik/';
const TASLAK = 'mj-cms-taslak';

class Durum {
  gh!: GitHub;
  tabanCommit = '';
  /** dosya anahtarı ('ana', 'sayfalar/x') → depodaki yol ve blob sha */
  kaynak: Record<string, { yol: string; sha: string }> = {};
  orijinal: Record<string, any> = {};
  calisma: Record<string, any> = {};
  degisiklikler: Degisiklik[] = [];
  yuklemeler: Yukleme[] = [];
  yeniDosyalar = new Set<string>();
  silinenler = new Set<string>();
  /** public/img altındaki mevcut görseller (seçici için) */
  gorseller: string[] = [];
  private dinleyiciler = new Set<() => void>();

  dinle(f: () => void) { this.dinleyiciler.add(f); return () => this.dinleyiciler.delete(f); }
  bildir() { this.taslakKaydet(); this.dinleyiciler.forEach((f) => f()); }

  async yukle(gh: GitHub) {
    this.gh = gh;
    const son = await gh.sonCommit();
    this.tabanCommit = son.commit;
    const agac = await gh.agac(son.agac);
    this.gorseller = agac.filter((x) => x.type === 'blob' && /^public\/(img|posters)\/.+\.(jpe?g|png|webp)$/i.test(x.path))
      .map((x) => x.path.replace(/^public/, ''));
    const jsonlar = agac.filter((x) => x.type === 'blob' && x.path.startsWith(ICERIK) && x.path.endsWith('.json'));
    this.kaynak = {}; this.orijinal = {}; this.calisma = {};
    await Promise.all(jsonlar.map(async (x) => {
      const anahtar = x.path.slice(ICERIK.length, -5);
      const veri = JSON.parse(await gh.metinBlob(x.sha));
      this.kaynak[anahtar] = { yol: x.path, sha: x.sha };
      this.orijinal[anahtar] = veri;
      this.calisma[anahtar] = kopya(veri);
    }));
    this.degisiklikler = []; this.yuklemeler = []; this.yeniDosyalar.clear(); this.silinenler.clear();
    this.taslakYukle();
    this.bildir();
  }

  al(dosya: string, yol = '') { return oku(this.calisma[dosya], yol); }

  /** Bir alanı değiştir. Aynı alanın önceki değişikliği birleştirilir; orijinale dönerse liste'den düşer. */
  ayarla(dosya: string, yol: string, deger: unknown, etiket = '') {
    if (!this.calisma[dosya]) return;
    const once = this.yeniDosyalar.has(dosya) ? undefined : oku(this.orijinal[dosya], yol);
    if (yol) yaz(this.calisma[dosya], yol, kopya(deger)); else this.calisma[dosya] = kopya(deger);
    this.degisiklikler = this.degisiklikler.filter((d) => !(d.dosya === dosya && d.yol === yol));
    if (JSON.stringify(once) !== JSON.stringify(deger)) this.degisiklikler.push({ dosya, yol, once, sonra: kopya(deger), etiket: etiket || yol });
    this.bildir();
  }

  yeniDosya(dosya: string, veri: unknown, etiket: string) {
    this.calisma[dosya] = kopya(veri);
    this.yeniDosyalar.add(dosya);
    this.silinenler.delete(dosya);
    this.degisiklikler.push({ dosya, yol: '', once: undefined, sonra: '(yeni sayfa)', etiket });
    this.bildir();
  }

  dosyaSil(dosya: string, etiket: string) {
    if (this.yeniDosyalar.has(dosya)) {
      this.yeniDosyalar.delete(dosya);
      delete this.calisma[dosya];
      this.degisiklikler = this.degisiklikler.filter((d) => d.dosya !== dosya);
    } else {
      this.silinenler.add(dosya);
      this.degisiklikler = this.degisiklikler.filter((d) => d.dosya !== dosya);
      this.degisiklikler.push({ dosya, yol: '', once: '(sayfa)', sonra: '(silinecek)', etiket });
    }
    this.bildir();
  }

  geriAl(i: number) {
    const d = this.degisiklikler[i];
    if (!d) return;
    if (this.yeniDosyalar.has(d.dosya) && d.yol === '') { this.dosyaSil(d.dosya, ''); return; }
    if (this.silinenler.has(d.dosya) && d.yol === '') { this.silinenler.delete(d.dosya); }
    else if (d.yol) yaz(this.calisma[d.dosya], d.yol, kopya(oku(this.orijinal[d.dosya], d.yol)));
    this.degisiklikler.splice(i, 1);
    this.bildir();
  }

  tumunuAt() {
    for (const k of Object.keys(this.calisma)) if (this.yeniDosyalar.has(k)) delete this.calisma[k];
    for (const k of Object.keys(this.orijinal)) this.calisma[k] = kopya(this.orijinal[k]);
    this.degisiklikler = []; this.yuklemeler = []; this.yeniDosyalar.clear(); this.silinenler.clear();
    this.bildir();
  }

  yuklemeEkle(y: Yukleme) { this.yuklemeler.push(y); if (!this.gorseller.includes(y.src)) this.gorseller.unshift(y.src); this.bildir(); }

  get bekleyenSayisi() { return this.degisiklikler.length; }

  /** Commit edilecek dosyalar */
  paket() {
    const kirli = new Set(this.degisiklikler.map((d) => d.dosya));
    const dosyalar: { yol: string; metin?: string; base64?: string; sil?: boolean }[] = [];
    for (const k of kirli) {
      if (this.silinenler.has(k)) { dosyalar.push({ yol: this.kaynak[k].yol, sil: true }); continue; }
      dosyalar.push({ yol: this.kaynak[k]?.yol ?? `${ICERIK}${k}.json`, metin: JSON.stringify(this.calisma[k], null, 2) + '\n' });
    }
    // Yalnızca hâlâ kullanılan yüklemeler gönderilir
    const tumMetin = JSON.stringify(this.calisma);
    for (const y of this.yuklemeler) if (tumMetin.includes(y.src)) dosyalar.push({ yol: y.yol, base64: y.base64 });
    return dosyalar;
  }

  /** Değişen dosyalar biz çalışırken başka yerden değişti mi? */
  async cakismaVarMi() {
    const son = await this.gh.sonCommit();
    if (son.commit === this.tabanCommit) return [];
    const agac = await this.gh.agac(son.agac);
    const kirli = new Set(this.degisiklikler.map((d) => d.dosya));
    return [...kirli].filter((k) => {
      const uzak = agac.find((x) => x.path === (this.kaynak[k]?.yol ?? `${ICERIK}${k}.json`));
      return this.kaynak[k] ? uzak?.sha !== this.kaynak[k].sha : !!uzak;
    });
  }

  // ---- Taslak: yayınlanmamış değişiklikler tarayıcıda saklanır (sayfa yenilense de kaybolmaz) ----
  private taslakKaydet() {
    try {
      if (!this.degisiklikler.length) { localStorage.removeItem(TASLAK); return; }
      const kirli = [...new Set(this.degisiklikler.map((d) => d.dosya))];
      localStorage.setItem(TASLAK, JSON.stringify({
        taban: Object.fromEntries(kirli.map((k) => [k, this.kaynak[k]?.sha ?? null])),
        calisma: Object.fromEntries(kirli.filter((k) => this.calisma[k]).map((k) => [k, this.calisma[k]])),
        degisiklikler: this.degisiklikler, yuklemeler: this.yuklemeler,
        yeni: [...this.yeniDosyalar], silinen: [...this.silinenler],
      }));
    } catch { /* depolama dolu ya da kapalı: taslak tutulmaz */ }
  }

  taslakVar = false;
  private taslakYukle() {
    try {
      const t = JSON.parse(localStorage.getItem(TASLAK) || 'null');
      if (!t) return;
      // Depodaki dosya o arada değiştiyse taslak uygulanmaz (eski sürümün üstüne yazmayalım)
      const uyumlu = Object.entries(t.taban as Record<string, string | null>).every(([k, sha]) => (this.kaynak[k]?.sha ?? null) === sha);
      if (!uyumlu) { localStorage.removeItem(TASLAK); return; }
      Object.assign(this.calisma, t.calisma);
      this.degisiklikler = t.degisiklikler; this.yuklemeler = t.yuklemeler || [];
      this.yeniDosyalar = new Set(t.yeni); this.silinenler = new Set(t.silinen);
      this.taslakVar = this.degisiklikler.length > 0;
    } catch { /* bozuk taslak yok sayılır */ }
  }

  yayinlandi(sha: string) {
    for (const k of Object.keys(this.calisma)) this.orijinal[k] = kopya(this.calisma[k]);
    for (const k of this.silinenler) { delete this.orijinal[k]; delete this.calisma[k]; delete this.kaynak[k]; }
    this.degisiklikler = []; this.yuklemeler = []; this.yeniDosyalar.clear(); this.silinenler.clear();
    this.tabanCommit = sha;
    this.bildir();
  }
}

export const durum = new Durum();
