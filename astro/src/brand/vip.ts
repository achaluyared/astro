import type { BrandConfig } from './types';

/** addisvipgirls.com — keep on its own branch/deploy with BRAND=vip in .env */
export const vipBrand: BrandConfig = {
  id: 'vip',
  siteName: 'Addis VIP Escorts',
  homeTitle: 'Addis VIP Escorts',
  homeDescription:
    'Addis VIP Escorts connects elite clients with verified independent escorts in Addis Ababa. Browse premium profiles, discreet contact, and 24/7 availability.',
  defaultOgImage: '/images/home/hero.jpg',
  contact: {
    whatsapp: 'https://wa.me/251722060793',
    telegram: 'https://t.me/+251722060793',
    email: 'Info@addisvipgirls.com',
    phoneDisplay: '+251 722 060 793',
  },
  homeLayout: 'vip',
  logo: { before: 'Addis', accent: ' VIP', after: ' Escorts' },
  faqs: [
    {
      q: 'How does your verification process work?',
      a: 'We require: Valid government ID + face verification. In-person interview at our Bole office. Two professional references. Ongoing client feedback monitoring. This ensures only genuine, high-quality companions are listed.',
    },
    {
      q: 'What areas of Addis Ababa do you serve?',
      a: 'Our companions are available across all major districts: Bole (Airport Road, Hayahulet), Kazanchis (Business District), Old Piassa (Historic Area), CMC (Luxury Residences). Same-day bookings available in most locations.',
    },
    {
      q: 'Are your companions fluent in English?',
      a: '90% of our escorts speak conversational English. 40% are fluent in Arabic or other languages. We have a dedicated Amharic-speaking team for local clients.',
    },
    {
      q: 'How do I ensure discretion?',
      a: 'We provide encrypted messaging (message auto-delete option), discreet billing, optional hotel booking assistance, and no visible branding during meetings.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'Cash (ETB/USD), cryptocurrency (BTC, ETH), wire transfers (discreet descriptions), and credit cards processed through 3rd-party travel agencies.',
    },
    {
      q: 'Can I book companions for travel outside Ethiopia?',
      a: 'Yes! Many companions offer domestic trips (Lalibela, Dire Dawa) and international travel (Dubai, Nairobi, Europe). Requires 14-day advance notice for visa arrangements.',
    },
    {
      q: 'Do you offer same-day bookings?',
      a: 'Available for premium members (85% success rate). Standard members: 12-hour notice recommended. Emergency requests: +25% fee (contact concierge).',
    },
    {
      q: "What's your cancellation policy?",
      a: '100% refund if canceled more than 24hrs before. 50% refund less than 24hrs (escort compensation). No-shows forfeit payment. Exceptions for verified emergencies.',
    },
  ],
};
