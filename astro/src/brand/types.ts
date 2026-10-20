export type BrandId = 'massage' | 'vip';

export type BrandFaq = { q: string; a: string };

export type BrandConfig = {
  id: BrandId;
  siteName: string;
  homeTitle: string;
  homeDescription: string;
  /** Default Open Graph image (site-relative path). */
  defaultOgImage?: string;
  contact: {
    whatsapp: string;
    telegram: string;
    email: string;
    phoneDisplay: string;
  };
  /** Which home template to render (see pages/index.astro). */
  homeLayout: 'massage' | 'vip';
  logo: { before: string; accent: string; after?: string };
  faqs: BrandFaq[];
};
