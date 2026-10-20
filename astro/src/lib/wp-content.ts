/** Normalize WordPress HTML copied into static pages (LocalWP leftovers, etc.). */
const DEFAULT_CONTACT_EMAIL = 'Info@addisvipgirls.com';

export function sanitizeWpHtml(html: string, contactEmail = DEFAULT_CONTACT_EMAIL): string {
  return html
    .replace(/Admin@1\.local/gi, contactEmail)
    .replace(/mailto:Admin@1\.local/gi, `mailto:${contactEmail}`);
}
