// JSON-LD (schema.org) üreticileri. Doğrulanmamış alan girmez (CLAUDE.md).
import { isletme, telUluslararasi } from '../data/isletme';
import { menu } from '../data/menu';
import { etkinlikler } from '../data/program';
import { ana } from './icerik';

const u = (yol = '') => `${isletme.site}/${yol.replace(/^\//, '')}`;
const a = isletme.adres;
export const adres = {
  '@type': 'PostalAddress', streetAddress: `${a.sokak}, ${a.mekan}`, addressLocality: a.ilce,
  addressRegion: a.il, postalCode: a.postaKodu, addressCountry: 'TR',
};

export const isletmeSema = () => {
  const d: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': ['BarOrPub', 'Restaurant'], '@id': u('#mujgan'),
    name: isletme.ad, alternateName: isletme.digerAdlar,
    description: "Çayyolu Beysupark AVM'de pub, kokteyl bar ve restoran: öğle ve akşam yemeği, paket servis, karaoke ve canlı müzik.",
    url: u(), image: [u('img/hgp-6015.jpg'), u('img/hgp-6041.jpg'), u('img/dsc06657.jpg')], logo: u('favicon.svg'),
    servesCuisine: ['Burger', 'Pizza', 'Bowl', 'Izgara', 'Kokteyl'], priceRange: '₺₺', currenciesAccepted: 'TRY',
    acceptsReservations: true, hasMenu: u('menu/'), foundingDate: isletme.kurulus,
    sameAs: [isletme.instagram.url], areaServed: [...isletme.yakinSemtler, a.ilce],
  };
  if (a.sokak) d.address = adres;
  if (isletme.haritaLinki) d.hasMap = isletme.haritaLinki;
  if (isletme.saatler.acilis && isletme.saatler.kapanis) d.openingHoursSpecification = [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: isletme.saatler.acilis, closes: isletme.saatler.kapanis }];
  if (isletme.telefon) d.telephone = telUluslararasi(isletme.telefon);
  return d;
};

export const siteSema = () => ({ '@context': 'https://schema.org', '@type': 'WebSite', name: isletme.tamAd, url: u(), inLanguage: 'tr-TR' });

export const sssSema = () => ({ '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: ana.sss.sorular.map((q) => ({ '@type': 'Question', name: q.soru, acceptedAnswer: { '@type': 'Answer', text: q.cevap } })) });

export const yolSema = (ad: string, yol: string) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: isletme.tamAd, item: u() },
  { '@type': 'ListItem', position: 2, name: ad, item: u(yol) }] });

export const menuSema = () => ({ '@context': 'https://schema.org', '@type': 'Menu', name: `${isletme.tamAd} Menü`, inLanguage: 'tr', url: u('menu/'),
  hasMenuSection: menu.map((k) => ({ '@type': 'MenuSection', name: k.baslik,
    hasMenuItem: k.kalemler.filter((x) => typeof x.fiyat === 'number').map((x) => ({ '@type': 'MenuItem', name: x.ad,
      offers: { '@type': 'Offer', price: String(x.fiyat), priceCurrency: 'TRY' } })) })) });

export const etkinlikSema = (bugun = new Date()) => {
  const yer = { '@type': 'Place', name: isletme.tamAd, address: adres };
  const duzenleyen = { '@type': 'Organization', name: isletme.tamAd, url: u() };
  const ortak = { eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: yer, organizer: duzenleyen };
  const out: object[] = etkinlikler.map((e) => ({ '@context': 'https://schema.org', '@type': 'MusicEvent', name: `${e.baslik} · ${isletme.tamAd}`,
    startDate: `${e.tarih}T${e.saat}:00+03:00`, performer: { '@type': 'MusicGroup', name: e.baslik }, image: [u('img/dsc06657.jpg')],
    description: `${e.tur} · ${isletme.tamAd} sahnesinde, saat ${e.saat.replace(':', '.')}.`, ...ortak }));
  // Haftalık karaoke: build tarihinden itibaren 4 perşembe (site her hafta yeniden build edilmeli)
  const d = new Date(bugun); d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7));
  for (let i = 0; i < 4; i++) {
    const g = new Date(d); g.setDate(d.getDate() + i * 7);
    const iso = `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, '0')}-${String(g.getDate()).padStart(2, '0')}`;
    out.push({ '@context': 'https://schema.org', '@type': 'Event', name: `Karaoke Gecesi · ${isletme.tamAd}`, startDate: `${iso}T20:00:00+03:00`,
      image: [u('posters/karaoke.jpg')], description: "Her perşembe 20.00'de karaoke: ekibini topla, şarkını seç, birlikte söyle.", ...ortak });
  }
  return out;
};
