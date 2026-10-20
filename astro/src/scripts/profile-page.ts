/** Profile page UI — delegation + astro:page-load (survives view transitions). */

let profilePageBound = false;

function contactSheet(): HTMLDialogElement | null {
  return document.getElementById('contact-sheet') as HTMLDialogElement | null;
}

function toggleTaxExpand(btn: HTMLElement) {
  const rootId = btn.id === 'svc-more' ? 'svc-list' : btn.id === 'cat-more' ? 'cat-row' : null;
  if (!rootId) return;
  const root = document.getElementById(rootId);
  if (!root) return;

  const labelMore = btn.getAttribute('data-label-more') || 'Show more';
  const labelLess = btn.getAttribute('data-label-less') || 'Show less';

  if (root.hasAttribute('data-expanded')) {
    root.removeAttribute('data-expanded');
    btn.textContent = labelMore;
  } else {
    root.setAttribute('data-expanded', '');
    btn.textContent = labelLess;
  }
}

function initMobileTabs() {
  const tabs = document.getElementById('profile-tabs');
  const main = document.getElementById('main-content');
  if (!tabs || !main) return;

  const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>('[data-tab]'));
  if (buttons.length < 2) return;

  tabs.hidden = false;
  main.classList.add('tabs-on');

  const active = main.querySelector<HTMLElement>('[data-panel].tab-active');
  const activeName = active?.getAttribute('data-panel') ?? buttons[0].getAttribute('data-tab');
  if (activeName) showProfileTab(activeName);
}

function showProfileTab(name: string | null) {
  if (!name) return;
  const tabs = document.getElementById('profile-tabs');
  const main = document.getElementById('main-content');
  if (!tabs || !main) return;

  tabs.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => {
    const on = b.getAttribute('data-tab') === name;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });

  main.querySelectorAll<HTMLElement>('[data-panel]').forEach((section) => {
    section.classList.toggle('tab-active', section.getAttribute('data-panel') === name);
  });
}

function wirePhoneReveal(el: HTMLElement) {
  if (el.dataset.phoneWired === '1') return;
  el.dataset.phoneWired = '1';
  el.addEventListener(
    'click',
    function once() {
      const tel = el.getAttribute('data-tel');
      const display = el.getAttribute('data-display') || tel;
      if (!tel) return;
      if (el.id === 'phone-btn-dock') {
        location.href = 'tel:' + tel.replace(/\D/g, '');
        el.textContent = display ?? tel;
        return;
      }
      const a = document.createElement('a');
      a.className = el.className;
      a.href = 'tel:' + tel.replace(/\D/g, '');
      a.textContent = display ?? tel;
      if (el.tagName === 'BUTTON') {
        a.classList.add('btn', 'primary');
        el.replaceWith(a);
      } else {
        el.textContent = display ?? tel;
        (el as HTMLAnchorElement).href = a.href;
      }
    },
    { once: true },
  );
}

function initPhoneButtons() {
  ['phone-btn', 'phone-btn-mobile-inline', 'phone-btn-dock'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) wirePhoneReveal(el);
  });
}

function onDocumentClick(e: MouseEvent) {
  if (!document.getElementById('main-content')) return;

  const target = e.target as Element | null;
  if (!target) return;

  const expandBtn = target.closest('#svc-more, #cat-more') as HTMLElement | null;
  if (expandBtn) {
    e.preventDefault();
    toggleTaxExpand(expandBtn);
    return;
  }

  const tabBtn = target.closest('#profile-tabs [data-tab]') as HTMLButtonElement | null;
  if (tabBtn) {
    e.preventDefault();
    showProfileTab(tabBtn.getAttribute('data-tab'));
    return;
  }

  if (target.closest('#contact-more')) {
    e.preventDefault();
    contactSheet()?.showModal();
    return;
  }

  if (target.closest('#contact-sheet-close')) {
    e.preventDefault();
    contactSheet()?.close();
    return;
  }

  const sheet = contactSheet();
  if (sheet && target === sheet) {
    sheet.close();
  }
}

function bindProfilePageListeners() {
  if (profilePageBound) return;
  profilePageBound = true;
  document.addEventListener('click', onDocumentClick);
}

function shuffleRecommendedGrid() {
  const grid = document.getElementById('recommended-grid');
  if (!grid) return;
  const cards = Array.from(grid.children);
  if (cards.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  cards.forEach((node) => grid.appendChild(node));
}

function onProfilePageLoad() {
  if (!document.querySelector('.profile-page')) return;
  bindProfilePageListeners();
  initMobileTabs();
  initPhoneButtons();
  shuffleRecommendedGrid();
}

onProfilePageLoad();
document.addEventListener('astro:page-load', onProfilePageLoad);
