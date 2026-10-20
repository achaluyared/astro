/** Mobile drawer — document delegation survives Astro view transitions. */
function els() {
  return {
    btn: document.getElementById('nav-toggle'),
    drawer: document.getElementById('nav-drawer'),
  };
}

function setOpen(open: boolean) {
  const { btn, drawer } = els();
  if (!btn || !drawer) return;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  drawer.hidden = !open;
  document.body.classList.toggle('nav-open', open);
}

function closeDrawer() {
  setOpen(false);
}

let mobileNavBound = false;

function bindMobileNavListeners() {
  if (mobileNavBound) return;
  mobileNavBound = true;

  document.addEventListener(
    'click',
    (e) => {
      const { btn, drawer } = els();
      if (!btn || !drawer) return;
      if (btn.contains(e.target as Node)) {
        e.preventDefault();
        setOpen(drawer.hidden);
        return;
      }
      const link = (e.target as Element).closest?.('#nav-drawer a');
      if (link) closeDrawer();
    },
    true,
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

function syncDrawer() {
  closeDrawer();
}

bindMobileNavListeners();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncDrawer);
} else {
  syncDrawer();
}
document.addEventListener('astro:page-load', syncDrawer);
