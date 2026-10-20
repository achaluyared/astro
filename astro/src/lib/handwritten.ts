// Pages whose text is NOT stored in WordPress post_content (it comes from PremiumPress /
// Elementor templates), so it cannot be fetched through the API. Fill these in from the
// live pages. Keys are URL slugs and must stay identical to the current URLs.
export const handwritten: Record<string, { title: string; description?: string; html: string }> = {
  // 'about-us': { title: 'About Us', description: '...', html: '<p>...</p>' },
  // 'faq': { title: 'FAQ', html: '...' },
  // 'contact': { title: 'Contact', html: '...' },
  // 'how-it-works': { title: 'How it works', html: '...' },
  // 'testimonials': { title: 'Testimonials', html: '...' },
};
