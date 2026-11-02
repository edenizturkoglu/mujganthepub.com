/**
 * Müjgân CMS sunucusu — Google Apps Script web uygulaması.
 *
 * Görevleri:
 *  1. Yetkili e-postalara sihirli giriş bağlantısı göndermek (MailApp, Deniz'in Gmail'inden).
 *  2. Bağlantıyı doğrulayıp imzalı oturum vermek.
 *  3. CMS'in GitHub isteklerini, GitHub anahtarını tarayıcıya hiç vermeden iletmek (yalnızca bu depo, yalnızca içerik yazma yolları).
 *
 * Script Properties (Proje Ayarları → Komut dosyası özellikleri):
 *  GITHUB_TOKEN  : fine-grained token (yalnızca edenizturkoglu/mujganthepub.com; Contents: Read and write, Actions: Read)
 *  YETKILILER    : virgülle ayrılmış e-postalar (ör. a@gmail.com,b@gmail.com)
 *  SITE          : https://mujganthepub.com
 *  GIZLI         : boş bırak; ilk çalışmada otomatik üretilir. Değiştirirsen tüm oturumlar kapanır.
 *
 * Dağıtım: Dağıt → Yeni dağıtım → Web uygulaması · Yürüten: Ben · Erişim: Herkes.
 */
var DEPO = 'edenizturkoglu/mujganthepub.com';
var LINK_SURE_SN = 15 * 60;          // giriş bağlantısı 15 dk geçerli
var OTURUM_SURE_SN = 7 * 24 * 3600;  // oturum 7 gün
var BEKLEME_SN = 60;                 // aynı adrese iki bağlantı arası

function doGet() {
  return ContentService.createTextOutput('Müjgân CMS sunucusu çalışıyor.');
}

function doPost(e) {
  var g;
  try { g = JSON.parse(e.postData.contents); } catch (_) { return yanit({ hata: 'Geçersiz istek' }, 400); }
  try {
    if (g.islem === 'link') return linkGonder(g.eposta);
    if (g.islem === 'dogrula') return dogrula(g.kod);
    if (g.islem === 'ben') { var o = oturumCoz(g.oturum); return o ? yanit({ eposta: o.e }) : yanit({ hata: 'Oturum geçersiz' }, 401); }
    if (g.islem === 'github') return github(g);
    return yanit({ hata: 'Bilinmeyen işlem' }, 400);
  } catch (err) {
    return yanit({ hata: String((err && err.message) || err) }, 500);
  }
}

// ---------- yardımcılar ----------
function yanit(o, durum) {
  o.durum = durum || 200;
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function ozellik(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function gizli() {
  var p = PropertiesService.getScriptProperties();
  var g = p.getProperty('GIZLI');
  if (!g) { g = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('GIZLI', g); }
  return g;
}
function yetkililer() {
  return (ozellik('YETKILILER') || '').split(/[,\s;]+/).map(function (x) { return x.trim().toLowerCase(); }).filter(String);
}
function rastgele() { return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, ''); }
function b64(x) { return Utilities.base64EncodeWebSafe(x).replace(/=+$/, ''); }
function imzala(o) {
  var p = b64(JSON.stringify(o));
  return p + '.' + b64(Utilities.computeHmacSha256Signature(p, gizli()));
}
function oturumCoz(t) {
  if (!t || typeof t !== 'string' || t.indexOf('.') < 0) return null;
  var parca = t.split('.');
  if (b64(Utilities.computeHmacSha256Signature(parca[0], gizli())) !== parca[1]) return null;
  var o;
  try { o = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parca[0])).getDataAsString()); } catch (_) { return null; }
  if (!o || o.exp < Math.floor(Date.now() / 1000)) return null;
  if (yetkililer().indexOf(o.e) < 0) return null; // listeden çıkarılan kişinin oturumu hemen kapanır
  return o;
}

// ---------- sihirli bağlantı ----------
function linkGonder(eposta) {
  var e = String(eposta || '').trim().toLowerCase();
  // Yanıt her durumda aynı: yetkili olmayan adresler ifşa edilmez
  if (yetkililer().indexOf(e) < 0) return yanit({ tamam: true });
  var onbellek = CacheService.getScriptCache();
  if (onbellek.get('bekle_' + e)) return yanit({ tamam: true });
  var kod = rastgele();
  onbellek.put('ml_' + kod, e, LINK_SURE_SN);
  onbellek.put('bekle_' + e, '1', BEKLEME_SN);
  var site = ozellik('SITE') || 'https://mujganthepub.com';
  var link = site + '/admin/#giris=' + kod;
  MailApp.sendEmail({
    to: e,
    name: 'Müjgân Yönetim',
    subject: 'Müjgân yönetim paneli giriş bağlantın',
    htmlBody:
      '<div style="font-family:Arial,sans-serif;font-size:15px;color:#222;max-width:480px">' +
      '<p>Merhaba,</p><p>Müjgân sitesinin yönetim paneline girmek için aşağıdaki düğmeye bas. Bağlantı <b>15 dakika</b> geçerli ve tek kullanımlık.</p>' +
      '<p style="margin:28px 0"><a href="' + link + '" style="background:#0B3D2E;color:#F6EBD7;padding:13px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Panele giriş yap</a></p>' +
      '<p style="color:#666;font-size:13px">Bu girişi sen istemediysen bu e-postayı yok sayabilirsin.</p></div>',
    body: 'Müjgân yönetim paneline giriş bağlantın (15 dakika geçerli): ' + link,
  });
  return yanit({ tamam: true });
}

function dogrula(kod) {
  if (!kod || !/^[0-9a-f]{64}$/.test(kod)) return yanit({ hata: 'Bağlantı geçersiz.' }, 401);
  var onbellek = CacheService.getScriptCache();
  var e = onbellek.get('ml_' + kod);
  if (!e) return yanit({ hata: 'Bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bağlantı iste.' }, 401);
  onbellek.remove('ml_' + kod);
  if (yetkililer().indexOf(e) < 0) return yanit({ hata: 'Bu adresin yetkisi yok.' }, 401);
  var exp = Math.floor(Date.now() / 1000) + OTURUM_SURE_SN;
  return yanit({ oturum: imzala({ e: e, exp: exp }), eposta: e, son: exp * 1000 });
}

// ---------- GitHub vekili ----------
// Yalnızca içerik okuma/yazma ve yayın durumu için gereken uçlar açık.
var IZIN = [
  ['GET', /^\/git\/ref\/heads\/main$/],
  ['GET', /^\/git\/commits\/[0-9a-f]{40}$/],
  ['GET', /^\/git\/trees\/[0-9a-f]{40}(\?recursive=1)?$/],
  ['GET', /^\/git\/blobs\/[0-9a-f]{40}$/],
  ['GET', /^\/actions\/runs\?head_sha=[0-9a-f]{40}&per_page=1$/],
  ['POST', /^\/git\/blobs$/],
  ['POST', /^\/git\/trees$/],
  ['POST', /^\/git\/commits$/],
  ['PATCH', /^\/git\/refs\/heads\/main$/],
];

function github(g) {
  var o = oturumCoz(g.oturum);
  if (!o) return yanit({ hata: 'Oturumun süresi doldu. Yeniden giriş yap.' }, 401);
  var yontem = String(g.yontem || 'GET').toUpperCase();
  var yol = String(g.yol || '');
  var izinli = IZIN.some(function (k) { return k[0] === yontem && k[1].test(yol); });
  if (!izinli) return yanit({ hata: 'Bu işleme izin yok: ' + yontem + ' ' + yol }, 403);
  var govde = g.govde;
  if (yontem === 'POST' && yol === '/git/commits' && govde) {
    // Commit'i değişikliği yapan kişinin adıyla imzala (kayıt için)
    govde.author = { name: o.e.split('@')[0], email: o.e, date: new Date().toISOString() };
  }
  if (yontem === 'PATCH' && govde) govde.force = false;
  var token = ozellik('GITHUB_TOKEN');
  if (!token) return yanit({ hata: 'Sunucuda GITHUB_TOKEN tanımlı değil.' }, 500);
  var secenek = {
    method: yontem.toLowerCase(),
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    muteHttpExceptions: true,
  };
  if (govde) { secenek.contentType = 'application/json'; secenek.payload = JSON.stringify(govde); }
  var r = UrlFetchApp.fetch('https://api.github.com/repos/' + DEPO + yol, secenek);
  var metin = r.getContentText();
  var veri = null;
  try { veri = metin ? JSON.parse(metin) : null; } catch (_) { veri = { message: metin.slice(0, 300) }; }
  return yanit({ gdurum: r.getResponseCode(), veri: veri });
}

/** Kurulum sonrası editörde bir kez çalıştır: e-posta izni ve GitHub erişimi kontrol edilir. */
function kurulumuDene() {
  gizli();
  Logger.log('Yetkililer: ' + yetkililer().join(', '));
  var r = UrlFetchApp.fetch('https://api.github.com/repos/' + DEPO, {
    headers: { Authorization: 'Bearer ' + ozellik('GITHUB_TOKEN'), Accept: 'application/vnd.github+json' }, muteHttpExceptions: true });
  var d = JSON.parse(r.getContentText());
  Logger.log('GitHub: ' + r.getResponseCode() + ' yazma izni: ' + (d.permissions && d.permissions.push));
  Logger.log('Kalan e-posta kotası: ' + MailApp.getRemainingDailyQuota());
}
