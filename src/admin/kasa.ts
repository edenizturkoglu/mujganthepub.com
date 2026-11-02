// GitHub erişim anahtarını şifreyle saklama: PBKDF2-SHA256 (600.000 tur) + AES-GCM 256.
// Şifreli kasa herkese açık depoda durur; şifre olmadan çözülemez. Güçlü şifre şart.
export type Kasa = { v: 1; tur: number; tuz: string; iv: string; veri: string };

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b as ArrayBuffer)));
const ub64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const TUR = 600_000;

async function anahtar(sifre: string, tuz: Uint8Array, tur: number) {
  const ham = await crypto.subtle.importKey('raw', new TextEncoder().encode(sifre), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: tuz, iterations: tur, hash: 'SHA-256' }, ham,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function kilitle(gizli: string, sifre: string): Promise<Kasa> {
  const tuz = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await anahtar(sifre, tuz, TUR);
  const veri = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, new TextEncoder().encode(gizli));
  return { v: 1, tur: TUR, tuz: b64(tuz), iv: b64(iv), veri: b64(veri) };
}

/** Yanlış şifrede hata fırlatır */
export async function ac(kasa: Kasa, sifre: string): Promise<string> {
  const k = await anahtar(sifre, ub64(kasa.tuz), kasa.tur);
  const acik = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ub64(kasa.iv) }, k, ub64(kasa.veri));
  return new TextDecoder().decode(acik);
}
