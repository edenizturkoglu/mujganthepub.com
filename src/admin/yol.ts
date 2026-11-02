// "a.b.0.c" biçimindeki JSON yollarıyla okuma/yazma.
export const parcala = (yol: string) => (yol ? yol.split('.') : []);

export function oku(obj: unknown, yol: string): any {
  return parcala(yol).reduce<any>((o, k) => (o == null ? undefined : o[k]), obj);
}

export function yaz(obj: any, yol: string, deger: unknown) {
  const p = parcala(yol);
  let o = obj;
  for (let i = 0; i < p.length - 1; i++) {
    if (o[p[i]] == null) o[p[i]] = /^\d+$/.test(p[i + 1]) ? [] : {};
    o = o[p[i]];
  }
  o[p[p.length - 1]] = deger;
}

export const kopya = <T>(x: T): T => JSON.parse(JSON.stringify(x));

/** "ana:hero.baslik" → { dosya: 'ana', yol: 'hero.baslik' } */
export function ayir(tam: string) {
  const i = tam.indexOf(':');
  return { dosya: tam.slice(0, i), yol: tam.slice(i + 1) };
}

export function slugla(s: string) {
  const tr: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', i: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return s.toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => tr[c] ?? c)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

/** İzin verilen sınırlı HTML (vurgu, kalın, satır sonu, paragraf, bağlantı) */
export function temizHtml(html: string) {
  const d = document.createElement('div');
  d.innerHTML = html;
  const izin = new Set(['EM', 'STRONG', 'B', 'I', 'BR', 'P', 'A']);
  const gez = (n: Element) => {
    [...n.children].forEach((c) => {
      gez(c);
      if (!izin.has(c.tagName)) { c.replaceWith(...c.childNodes); return; }
      [...c.attributes].forEach((a) => {
        if (!(c.tagName === 'A' && a.name === 'href' && /^(https?:|\/|#|mailto:|tel:)/.test(a.value))) c.removeAttribute(a.name);
      });
    });
  };
  gez(d);
  return d.innerHTML.replace(/&nbsp;/g, ' ').trim();
}
