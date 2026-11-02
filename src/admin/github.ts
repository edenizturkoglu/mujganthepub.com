// GitHub işlemleri CMS sunucusu (Apps Script) üzerinden yapılır; GitHub anahtarı tarayıcıya hiç gelmez.
import { SUNUCU } from './ayar';

export const DEPO = { sahip: 'edenizturkoglu', ad: 'mujganthepub.com', dal: 'main' };

export class GitHubHata extends Error { constructor(public durum: number, m: string) { super(m); } }

/** Sunucuya istek: Apps Script basit (text/plain) POST kabul eder, yanıtı { durum, ... } biçimindedir */
export async function sunucu<T = any>(islem: string, veri: Record<string, unknown> = {}): Promise<T & { durum: number; hata?: string }> {
  if (!SUNUCU) throw new GitHubHata(503, 'CMS sunucusu henüz kurulmadı.');
  let r: Response;
  try {
    r = await fetch(SUNUCU, { method: 'POST', body: JSON.stringify({ islem, ...veri }), redirect: 'follow' });
  } catch {
    throw new GitHubHata(0, 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.');
  }
  const j = await r.json().catch(() => null);
  if (!j) throw new GitHubHata(r.status || 500, 'Sunucudan anlaşılır yanıt gelmedi.');
  return j;
}

export class GitHub {
  constructor(private oturum: string) {}

  async istek<T = any>(yol: string, secenek: { method?: string; body?: string } = {}): Promise<T> {
    const j = await sunucu<{ gdurum?: number; veri?: any }>('github', {
      oturum: this.oturum, yontem: secenek.method ?? 'GET', yol, govde: secenek.body ? JSON.parse(secenek.body) : undefined,
    });
    if (j.durum !== 200) throw new GitHubHata(j.durum, j.hata ?? 'Sunucu hatası');
    if ((j.gdurum ?? 500) >= 300) throw new GitHubHata(j.gdurum ?? 500, j.veri?.message ?? 'GitHub hatası');
    return j.veri as T;
  }

  async sonCommit() {
    const ref = await this.istek<{ object: { sha: string } }>(`/git/ref/heads/${DEPO.dal}`);
    const c = await this.istek<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
    return { commit: ref.object.sha, agac: c.tree.sha };
  }

  async agac(sha: string) {
    const t = await this.istek<{ tree: { path: string; sha: string; type: string; size?: number }[]; truncated: boolean }>(`/git/trees/${sha}?recursive=1`);
    return t.tree;
  }

  async metinBlob(sha: string) {
    const b = await this.istek<{ content: string }>(`/git/blobs/${sha}`);
    const bayt = Uint8Array.from(atob(b.content.replace(/\n/g, '')), (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bayt);
  }

  /** Dosyaları tek commit'te yazar (sil: true → dosyayı kaldırır). Commit, giriş yapan kişinin e-postasıyla imzalanır. */
  async commit(mesaj: string, dosyalar: { yol: string; metin?: string; base64?: string; sil?: boolean }[]) {
    const son = await this.sonCommit();
    const agac = [] as { path: string; mode: '100644'; type: 'blob'; sha: string | null }[];
    for (const d of dosyalar) {
      if (d.sil) { agac.push({ path: d.yol, mode: '100644', type: 'blob', sha: null }); continue; }
      const blob = await this.istek<{ sha: string }>('/git/blobs', { method: 'POST',
        body: JSON.stringify(d.base64 !== undefined ? { content: d.base64, encoding: 'base64' } : { content: d.metin, encoding: 'utf-8' }) });
      agac.push({ path: d.yol, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const yeniAgac = await this.istek<{ sha: string }>('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: son.agac, tree: agac }) });
    const c = await this.istek<{ sha: string }>('/git/commits', { method: 'POST',
      body: JSON.stringify({ message: mesaj, tree: yeniAgac.sha, parents: [son.commit] }) });
    await this.istek(`/git/refs/heads/${DEPO.dal}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha, force: false }) });
    return c.sha;
  }

  async yayinDurumu(sha: string) {
    const r = await this.istek<{ workflow_runs: { status: string; conclusion: string | null; html_url: string }[] }>(`/actions/runs?head_sha=${sha}&per_page=1`);
    return r.workflow_runs[0] ?? null;
  }
}
