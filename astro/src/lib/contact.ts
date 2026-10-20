import { SITE_NAME } from './seo';
import type { Profile } from './data';

/** Same prefilled intro as the live PremiumPress WhatsappClick handler. */
export function whatsappProfileHref(digits: string, profileName: string): string {
  const text =
    `Hi ${profileName}, I saw your profile on ${SITE_NAME} and would like to arrange a meeting. ` +
    'Could you please share: ✓ Your availability ✓ Service options ✓ Rates';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export type ContactLink = { type: string; label: string; url: string; nofollow?: boolean };

/**
 * Every non-phone/non-WhatsApp channel as one list, so the page just loops.
 * A new network = one row in the WP plugin's social_networks() + an icon in ContactIcon.astro.
 */
export function contactLinks(p: Profile): ContactLink[] {
  const out: ContactLink[] = [];
  if (p.contact.telegramUrl) out.push({ type: 'telegram', label: 'Telegram', url: p.contact.telegramUrl });
  for (const l of p.contact.links) out.push(l);
  if (p.contact.website) out.push({ type: 'website', label: 'Website', url: p.contact.website, nofollow: true });
  return out;
}
