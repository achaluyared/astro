/** SEO-facing headings for the featured escorts carousel (VIP). */

export type FeaturedSliderContext = 'home' | 'search' | 'archive';

export function featuredSliderCopy(
  context: FeaturedSliderContext,
  options?: { termName?: string; tax?: string },
): { title: string; subtitle: string; description: string; sectionId: string } {
  if (context === 'search') {
    return {
      sectionId: 'sec-featured-search',
      title: 'Featured escorts',
      subtitle: 'Premium featured listings on Addis VIP Escorts — browse before you filter',
      description:
        'These companions have active featured placement on our directory. Use search filters below to narrow by city, age, verified status, and more.',
    };
  }

  if (context === 'archive' && options?.termName) {
    const name = options.termName;
    const tax = options.tax ?? '';

    if (tax === 'features') {
      return {
        sectionId: 'sec-featured-term',
        title: 'Featured escorts',
        subtitle: `Featured companions offering ${name} in Addis Ababa`,
        description: `Independent escorts with featured placement who list ${name} among their services. Full results for this service appear below.`,
      };
    }
    if (tax === 'country') {
      return {
        sectionId: 'sec-featured-term',
        title: 'Featured escorts',
        subtitle: `Featured companions in ${name}`,
        description: `Premium featured escorts based in or serving ${name}. Browse the complete directory listing below.`,
      };
    }
    if (tax === 'listing') {
      return {
        sectionId: 'sec-featured-term',
        title: 'Featured escorts',
        subtitle: `Featured ${name} escorts in Addis Ababa`,
        description: `Featured profiles in the ${name} category on Addis VIP Escorts. See all matching escorts in the grid below.`,
      };
    }
    return {
      sectionId: 'sec-featured-term',
      title: 'Featured escorts',
      subtitle: `Featured escorts — ${name}`,
      description: `Premium featured companions matching ${name}. Full listings appear below.`,
    };
  }

  return {
    sectionId: 'sec-featured-escorts',
    title: 'Featured escorts',
    subtitle: 'Handpicked featured escorts in Addis Ababa — verified profiles with premium directory placement',
    description:
      'Browse featured Addis VIP escorts selected for discretion, quality, and exclusive companionship in Bole, Kazanchis, CMC, and across the capital.',
  };
}
