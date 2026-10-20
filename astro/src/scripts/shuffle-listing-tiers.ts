/** Shuffle profile cards within each listing tier (Popular → Featured → Homepage → rest). */
export function shuffleListingTiers(gridId = 'grid') {
  const g = document.getElementById(gridId);
  if (!g) return;

  const cards = Array.from(g.querySelectorAll<HTMLElement>(':scope > .card'));
  if (cards.length < 2) return;

  const shuffle = (nodes: HTMLElement[]) => {
    if (nodes.length < 2) return nodes;
    const a = nodes.slice();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    return a;
  };

  const byTier = (tier: string) => cards.filter((c) => c.dataset.listingTier === tier);

  for (const tier of ['3', '2', '1', '0']) {
    shuffle(byTier(tier)).forEach((n) => g.appendChild(n));
  }
}

let tierShuffleTeardown: (() => void) | null = null;

export function initListingTierShuffle(gridId = 'grid') {
  tierShuffleTeardown?.();

  const run = () => shuffleListingTiers(gridId);
  run();
  document.addEventListener('astro:page-load', run);
  tierShuffleTeardown = () => document.removeEventListener('astro:page-load', run);
}
