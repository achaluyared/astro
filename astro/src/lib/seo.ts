import { brand } from '../brand';
import type { Profile } from './data';

export const SITE_NAME = brand.siteName;
export const homeTitle = brand.homeTitle;
export const homeDescription = brand.homeDescription;

export const profileTitle = (p: Profile) =>
  p.seo.title ??
  (brand.id === 'massage'
    ? `${p.title} | Massage in Addis Ababa | ${SITE_NAME}`
    : `${p.title} | Escort in Addis Ababa | ${SITE_NAME}`);

export const profileDescription = (p: Profile) =>
  p.seo.description ??
  (p.description
    ? truncate(p.description, 155)
    : brand.id === 'massage'
      ? `Book ${p.title} for professional massage in Addis Ababa. Verified listing on ${SITE_NAME} with photos and contact details.`
      : `Meet ${p.title}, a verified escort in Addis Ababa. View photos, rates, and discreet WhatsApp contact on ${SITE_NAME}.`);

/** Disambiguate shared term labels (e.g. Brown eyes vs Brown hair). */
const TERM_TITLE_QUALIFIER: Record<string, string> = {
  daeyes: 'Eyes',
  dahair: 'Hair',
  dabody: 'Body type',
  dadrink: 'Drinking',
  dasmoke: 'Smoking',
  dasexuality: 'Sexuality',
  dagender: 'Gender',
  dathnicity: 'Ethnicity',
  agency: 'Agency',
};

export function termLabel(name: string, tax?: string): string {
  const q = tax ? TERM_TITLE_QUALIFIER[tax] : undefined;
  return q ? `${name} ${q}` : name;
}

export const termTitle = (name: string, tax?: string) => {
  let label = termLabel(name, tax);
  if (label.length > 55) label = truncate(label, 55);
  return brand.id === 'massage'
    ? `${label} Archives | ${SITE_NAME}`
    : `${label} Escorts | ${SITE_NAME}`;
};

export function termDescription(name: string, tax?: string, profileCount?: number) {
  const label = termLabel(name, tax);
  const count = profileCount ?? 0;
  const escortNoun = count === 1 ? 'escort' : 'escorts';
  const countPrefix =
    count > 0
      ? count === 1
        ? '1 verified '
        : `${count.toLocaleString('en-US')} verified `
      : 'Verified ';
  if (brand.id === 'massage') {
    const provider = count === 1 ? 'provider' : 'providers';
    return `${countPrefix}${label.toLowerCase()} massage ${provider} in Addis Ababa. Compare profiles, services, and book directly on ${SITE_NAME}.`;
  }
  if (tax === 'country') {
    const companion = count === 1 ? 'companion' : 'escorts and companions';
    return `${countPrefix}${companion} in ${name}. Browse by area, verification, and services on ${SITE_NAME}.`;
  }
  if (tax === 'features') {
    return `${countPrefix}${escortNoun} offering ${truncate(name.toLowerCase(), 80)} in Addis Ababa. Discreet listings with photos and contact on ${SITE_NAME}.`;
  }
  if (tax === 'listing') {
    return `${countPrefix}${escortNoun} in the ${name} category. Premium companions in Ethiopia on ${SITE_NAME}.`;
  }
  return `${countPrefix}${label.toLowerCase()} ${escortNoun} in Addis Ababa and Ethiopia. Filter, compare, and contact listings on ${SITE_NAME}.`;
}

/** Visible intro on taxonomy archives — never raw WordPress SEO blobs. */
export function termArchiveIntro(name: string, profileCount: number, tax: string) {
  const n = profileCount.toLocaleString('en-US');
  if (brand.id === 'massage') {
    return tax === 'country'
      ? `${n} verified massage providers in ${name}.`
      : `${n} profiles tagged ${name}.`;
  }
  if (tax === 'country') {
    return `${n} verified escorts and companions in ${name}. Filter by area, age, or verification below.`;
  }
  if (tax === 'features') {
    return `${n} escorts offering ${name}.`;
  }
  if (tax === 'listing') {
    return `${n} escorts in the ${name} category.`;
  }
  return `${n} profiles in ${name}.`;
}

export const pageTitle = (title: string) => `${title} | ${SITE_NAME}`;

/** Title for taxonomy root archives (`/dadrink/`, `/features/`, …). */
export function taxonomyHubTitle(label: string) {
  const name = label.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return brand.id === 'massage' ? `${name} Archives | ${SITE_NAME}` : `${name} | ${SITE_NAME}`;
}

/** Short on-page blurb for taxonomy hubs. */
export function taxonomyHubIntro(taxKey: string, profileCount: number) {
  const n = profileCount.toLocaleString('en-US');
  if (profileCount === 0) return 'No Results Found';
  if (brand.id === 'massage') return `${n} profiles in this section.`;
  if (taxKey === 'country') return `${n} verified escorts and companions. Browse locations below.`;
  if (taxKey === 'features') return `${n} escorts by service and experience.`;
  if (taxKey === 'listing') return `${n} escorts by category.`;
  return `${n} profiles. Browse terms below.`;
}

/** Meta description for taxonomy hub index pages (150–160 chars target). */
export function taxonomyHubDescription(taxKey: string, profileCount: number, label: string) {
  const hub = label.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const n =
    profileCount > 0 ? `${profileCount.toLocaleString('en-US')} ` : '';
  if (brand.id === 'massage') {
    return `Browse ${n}${hub.toLowerCase()} massage listings in Addis Ababa. Verified providers on ${SITE_NAME}.`;
  }
  const hubDesc: Record<string, string> = {
    country: `Find ${n}verified escorts by city and area in Ethiopia. Discreet directory — ${SITE_NAME}.`,
    features: `Explore ${n}escorts by services and experiences in Addis Ababa. Verified companions on ${SITE_NAME}.`,
    listing: `Browse ${n}escorts by category — dinner dates, travel, and more on ${SITE_NAME}.`,
    dathnicity: `Browse escorts by ${hub.toLowerCase()} in Ethiopia. Verified Habesha and international companions on ${SITE_NAME}.`,
    dahair: `Find escorts by hair color and style in Addis Ababa. Verified profiles on ${SITE_NAME}.`,
    daeyes: `Find escorts by eye color in Addis Ababa. Photos, rates, and contact on ${SITE_NAME}.`,
  };
  return (
    hubDesc[taxKey] ??
    `Browse ${n}${hub.toLowerCase()} escort listings in Addis Ababa. Verified companions on ${SITE_NAME}.`
  );
}

export function truncate(s: string, n: number) {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, '') + '\u2026';
}

export function profilePersonLd(site: URL, p: Profile, imagePath?: string) {
  const url = new URL(p.path, site).href;
  const image = imagePath ? new URL(imagePath, site).href : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.title,
    url,
    ...(image ? { image } : {}),
    ...(p.location.city ? { homeLocation: { '@type': 'Place', name: p.location.city } } : {}),
  };
}

export function breadcrumbLd(site: URL, crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.path, site).href,
    })),
  };
}
