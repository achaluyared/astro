/** Featured escorts row carousel (VIP home). Cards match .profile-grid column widths. */

export const FEATURED_AUTO_SCROLL_MS = 6000;

/** Match .feat-carousel-track gap (0.75rem default, 0.65rem ≤620px). */
function trackGapPx(): number {
  if (typeof window === 'undefined') return 12;
  return window.matchMedia('(max-width: 620px)').matches ? 10.4 : 12;
}

let teardown: (() => void) | null = null;

function visibleCount(viewport: HTMLElement): number {
  const w = viewport.offsetWidth;
  if (w >= 900) return 4;
  if (w >= 620) return 3;
  return 2;
}

function stepPx(track: HTMLElement): number {
  const card = track.querySelector<HTMLElement>(':scope > .card');
  if (!card) return 0;
  return card.offsetWidth + trackGapPx();
}

function maxPos(viewport: HTMLElement, track: HTMLElement): number {
  const cards = track.querySelectorAll(':scope > .card').length;
  return Math.max(0, cards - visibleCount(viewport));
}

function bindCarousel(root: HTMLElement) {
  const viewport = root.querySelector<HTMLElement>('[data-feat-viewport]');
  const track = root.querySelector<HTMLElement>('[data-feat-track]');
  const prev = root.querySelector<HTMLButtonElement>('[data-feat-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-feat-next]');
  const dotsRoot = root.querySelector<HTMLElement>('[data-feat-dots]');
  if (!viewport || !track) return () => {};

  let pos = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const apply = () => {
    const max = maxPos(viewport, track);
    pos = Math.max(0, Math.min(pos, max));
    track.style.transform = `translateX(-${pos * stepPx(track)}px)`;
    if (prev) prev.disabled = pos <= 0;
    if (next) next.disabled = pos >= max;
    dotsRoot?.querySelectorAll('button').forEach((b, i) => {
      b.classList.toggle('is-active', i === pos);
      b.setAttribute('aria-selected', i === pos ? 'true' : 'false');
    });
  };

  const go = (delta: number) => {
    pos += delta;
    apply();
  };

  const rebuildDots = () => {
    if (!dotsRoot) return;
    dotsRoot.innerHTML = '';
    const pages = maxPos(viewport, track) + 1;
    for (let i = 0; i < pages; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Featured page ${i + 1}`);
      b.addEventListener('click', () => {
        pos = i;
        apply();
      });
      dotsRoot.appendChild(b);
    }
    apply();
  };

  const onPrev = () => go(-1);
  const onNext = () => go(1);
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);

  const onResize = () => rebuildDots();
  window.addEventListener('resize', onResize);
  rebuildDots();

  const stopAuto = () => {
    if (timer) clearInterval(timer);
    timer = undefined;
  };

  const startAuto = () => {
    stopAuto();
    if (reduced || maxPos(viewport, track) <= 0) return;
    timer = setInterval(() => {
      const max = maxPos(viewport, track);
      pos = pos >= max ? 0 : pos + 1;
      apply();
    }, FEATURED_AUTO_SCROLL_MS);
  };

  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node)) startAuto();
  });

  startAuto();

  return () => {
    stopAuto();
    prev?.removeEventListener('click', onPrev);
    next?.removeEventListener('click', onNext);
    window.removeEventListener('resize', onResize);
    root.removeEventListener('mouseenter', stopAuto);
    root.removeEventListener('mouseleave', startAuto);
  };
}

export function initFeaturedSliders() {
  teardown?.();
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-featured-carousel]').forEach((root) => {
    cleanups.push(bindCarousel(root));
  });
  teardown = () => {
    cleanups.forEach((fn) => fn());
    teardown = null;
  };
}

initFeaturedSliders();
document.addEventListener('astro:page-load', initFeaturedSliders);
