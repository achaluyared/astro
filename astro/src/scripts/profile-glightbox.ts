import GLightbox, { type GLightboxInstance } from '../lib/glightbox';

type GallerySlide = {
  src: string;
  preview?: string;
  width: number;
  height: number;
  alt?: string;
};

const LIGHTBOX_OPEN_CLASS = 'profile-lightbox-open';

let lightbox: GLightboxInstance | null = null;
let galleryIndex = 0;
let docClickBound = false;
let scrollYBeforeOpen = 0;

function setLightboxPageLock(open: boolean) {
  document.documentElement.classList.toggle(LIGHTBOX_OPEN_CLASS, open);
  document.body.classList.toggle(LIGHTBOX_OPEN_CLASS, open);
}

/** Keep modal a direct child of body and pinned to the viewport (not end-of-page flow). */
function pinLightboxToViewport() {
  const modal = document.getElementById('glightbox-body');
  if (!modal) return;

  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }
  document.body.insertBefore(modal, document.body.firstChild);

  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.margin = '0';
  modal.style.zIndex = '2147483646';

  window.scrollTo(0, scrollYBeforeOpen);
}

function cleanupGlightbox() {
  setLightboxPageLock(false);
  try {
    lightbox?.destroy();
  } catch {
    /* ignore */
  }
  lightbox = null;
  document.querySelectorAll('.glightbox-container').forEach((el) => el.remove());
  document.documentElement.classList.remove('glightbox-open');
  document.body.classList.remove(
    'glightbox-open',
    'touching',
    'gdesc-open',
    'glightbox-touch',
    'glightbox-mobile',
    'gscrollbar-fixer',
  );
}

function readSlides(): GallerySlide[] {
  const hero = document.getElementById('hero');
  if (!hero) return [];

  const dataId = hero.getAttribute('data-pswp-data-id') ?? 'pswp-data';
  const el =
    document.getElementById(dataId) ??
    document.querySelector('#site-main script[type="application/json"][id^="pswp-data"]');
  const raw = el?.textContent;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as GallerySlide[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function heroIndexFromDom(): number {
  const raw = document.getElementById('hero')?.getAttribute('data-index') ?? '0';
  const i = parseInt(raw, 10);
  return Number.isFinite(i) ? i : 0;
}

function toElements(slides: GallerySlide[]) {
  return slides.map((slide) => ({
    href: slide.src,
    type: 'image' as const,
    alt: slide.alt ?? '',
    title: slide.alt ?? '',
  }));
}

function setGalleryIndex(i: number, opts?: { openLightbox?: boolean }) {
  const slides = readSlides();
  if (!slides.length) return;

  galleryIndex = Math.max(0, Math.min(i, slides.length - 1));
  const slide = slides[galleryIndex];

  const heroImg = document.getElementById('hero-img') as HTMLImageElement | null;
  const preview = slide.preview ?? slide.src;
  if (heroImg && preview) {
    heroImg.src = preview;
    if (slide.alt) heroImg.alt = slide.alt;
  }

  document.querySelectorAll('#thumbs button').forEach((btn, j) => {
    btn.classList.toggle('active', j === galleryIndex);
  });

  const galleryCounter = document.getElementById('gallery-counter');
  if (galleryCounter) {
    galleryCounter.textContent = `${galleryIndex + 1} / ${slides.length}`;
  }

  document.getElementById('hero')?.setAttribute('data-index', String(galleryIndex));

  if (opts?.openLightbox) openGallery();
}

function stepHero(delta: number) {
  const slides = readSlides();
  if (slides.length < 2) return;
  const next = (galleryIndex + delta + slides.length) % slides.length;
  setGalleryIndex(next);
  const btn = document.querySelectorAll('#thumbs button')[next] as HTMLElement | undefined;
  btn?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
}

function openGallery() {
  const slides = readSlides();
  if (!slides.length) return;

  scrollYBeforeOpen = window.scrollY;
  cleanupGlightbox();

  const index = Math.max(0, Math.min(heroIndexFromDom(), slides.length - 1));
  galleryIndex = index;

  lightbox = GLightbox({
    elements: toElements(slides),
    startAt: index,
    touchNavigation: true,
    keyboardNavigation: true,
    closeButton: true,
    closeOnOutsideClick: true,
    loop: slides.length > 2,
    zoomable: true,
    draggable: true,
    openEffect: 'fade',
    closeEffect: 'fade',
    slideEffect: 'slide',
    descPosition: 'bottom',
  });

  lightbox.on('open', () => {
    setLightboxPageLock(true);
    pinLightboxToViewport();
    requestAnimationFrame(pinLightboxToViewport);
  });

  lightbox.on('close', () => {
    setLightboxPageLock(false);
    requestAnimationFrame(() => window.scrollTo(0, scrollYBeforeOpen));
  });

  lightbox.openAt(index);
}

function onDocumentClick(e: MouseEvent) {
  if (!document.getElementById('hero')) return;

  const target = e.target as Element | null;
  if (!target) return;

  if (target.closest('#hero-open-lightbox')) {
    e.preventDefault();
    e.stopPropagation();
    openGallery();
    return;
  }

  if (target.closest('#hero-prev')) {
    e.preventDefault();
    e.stopPropagation();
    stepHero(-1);
    return;
  }

  if (target.closest('#hero-next')) {
    e.preventDefault();
    e.stopPropagation();
    stepHero(1);
    return;
  }

  const thumb = target.closest('#thumbs button[data-index]') as HTMLButtonElement | null;
  if (thumb) {
    const i = parseInt(thumb.getAttribute('data-index') ?? '0', 10);
    if (Number.isFinite(i)) setGalleryIndex(i);
  }
}

function initProfileGallery() {
  if (!document.getElementById('hero')) return;

  galleryIndex = heroIndexFromDom();
  if (!document.getElementById('hero')?.getAttribute('data-index')) {
    document.getElementById('hero')?.setAttribute('data-index', '0');
    galleryIndex = 0;
  }

  if (!docClickBound) {
    document.addEventListener('click', onDocumentClick);
    docClickBound = true;
  }
}

function onPageLoad() {
  cleanupGlightbox();
  initProfileGallery();
}

onPageLoad();
document.addEventListener('astro:page-load', onPageLoad);
