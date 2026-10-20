import type { BrandConfig } from './types';

export const massageBrand: BrandConfig = {
  id: 'massage',
  siteName: 'Massage In Addis Ababa',
  homeTitle: 'Massage Girls Addis Ababa | Private & Outcall Massage Services',
  homeDescription:
    'Find the best massage girls in Addis Ababa offering private, relaxing, and discreet experiences. Browse verified profiles and connect instantly for outcall or incall massage services.',
  defaultOgImage: '/logo.svg',
  contact: {
    whatsapp: 'https://wa.me/251901269396',
    telegram: 'https://t.me/+251901269396',
    email: 'info@massageinaddisababa.com',
    phoneDisplay: '+251 901 269 396',
  },
  homeLayout: 'massage',
  logo: { before: 'Massage in ', accent: 'Addis' },
  faqs: [
    {
      q: 'How are massage providers verified on this site?',
      a: 'Listings are reviewed before they go live. We check profile consistency, contact details, and photos where possible. Providers can update their services, rates, and availability directly so what you see stays current.',
    },
    {
      q: 'Which areas of Addis Ababa do you cover?',
      a: 'Providers list their own service areas—commonly Bole, Kazanchis, CMC, Sar Bet, and other central districts. Use search and location filters to find someone near you. Incall and outcall options depend on each profile.',
    },
    {
      q: 'What types of massage can I book?',
      a: 'Services vary by provider: Swedish, deep tissue, body-to-body, tantric-style relaxation, hot stone, and more. Each profile lists what they offer; message them on WhatsApp or Telegram to confirm style, duration, and pricing.',
    },
    {
      q: 'Is booking discreet?',
      a: 'Yes. You contact providers directly—no agency middleman. Use WhatsApp or Telegram for private messaging. We do not share your inquiries with third parties.',
    },
    {
      q: 'How do payments work?',
      a: 'Payment terms are agreed directly with your provider (usually cash in ETB or USD at the time of service). This site is a directory only; we do not process payments or hold deposits.',
    },
    {
      q: 'Can I book for the same day?',
      a: 'Many providers accept same-day requests when their calendar is open. Message them with your preferred time, location (incall/outcall), and session length. Response times vary by provider.',
    },
    {
      q: 'I am a massage therapist—how do I join?',
      a: 'Contact us on WhatsApp or Telegram from the Contact page or the “Are You a Massage Girl” section on the home page. We will guide you through creating a verified listing on the platform.',
    },
    {
      q: 'What if I need to cancel or reschedule?',
      a: 'Cancellation policies are set by each provider. Message them as early as possible. Repeated no-shows may affect future bookings at their discretion.',
    },
  ],
};
