// GitHub REST API: içerik dosyalarını okuma, tek commit'te çok dosya yazma, yayın (Actions) durumu.
export const DEPO = { sahip: 'edenizturkoglu', ad: 'mujganthepub.com', dal: 'main' };
const API = `https://api.github.com/repos/${DEPO.sahip}/${DEPO.ad}`;

export class GitHubHata extends Error { constructor(public durum: number, m: string) { super(m); } }

export class GitHub {
  constructor(private token: string) {}

  async istek<T = any>(yol: string, secenek: RequestInit = {}): Promise<T> {
    const r = await fetch(yol.startsWith('http') ? yol : API + yol, {
      ...secenek,
      cache: 'no-store',
      headers: { Authorization: `Bearer ${this.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
        ...(secenek.body ? { 'Content-Type': 'application/json' } : {}) },
    });
    if (!r.ok) {
      let m = r.statusText;
      try { m = (await r.json()).message || m; } catch { /* boş */ }
      throw new GitHubHata(r.status, m);
    }
    return r.status === 204 ? (undefined as T) : r.json();
  }

  depo() { return this.istek<{ permissions?: { push?: boolean }; full_name: string }>(''); }

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

  /** Dosyaları tek commit'te yazar. icerik null → dosyayı siler. Dal başka yerden ilerlediyse `beklenen` ile yakalanır. */
  async commit(mesaj: string, dosyalar: { yol: string; metin?: string; base64?: string; sil?: boolean }[], beklenen?: string) {
    const son = await this.sonCommit();
    if (beklenen && son.commit !== beklenen) throw new GitHubHata(409, 'Dal değişti');
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
