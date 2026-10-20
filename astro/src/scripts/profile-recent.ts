/** Recently viewed profiles — localStorage key must stay `addis_recent`. */

import { RECENT_MAX, RECENT_STORAGE_KEY } from '../lib/storage';

type RecentEntry = { slug: string; title: string; path: string };

function readRecent(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentEntry =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as RecentEntry).slug === 'string' &&
        typeof (e as RecentEntry).title === 'string' &&
        typeof (e as RecentEntry).path === 'string',
    );
  } catch {
    return [];
  }
}

function writeRecent(entries: RecentEntry[]) {
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(entries.slice(0, RECENT_MAX)));
  } catch {
    /* quota / private mode */
  }
}

function pushRecent(entry: RecentEntry) {
  const rest = readRecent().filter((e) => e.slug !== entry.slug);
  writeRecent([entry, ...rest]);
}

function renderRecentList(currentSlug: string) {
  const section = document.getElementById('recent-section');
  const list = document.getElementById('recent-list');
  if (!section || !list) return;

  const items = readRecent().filter((e) => e.slug !== currentSlug);
  if (items.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  list.replaceChildren(
    ...items.map((e) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = e.path;
      a.textContent = e.title;
      a.className = 'text-vip-gold-light no-underline hover:underline';
      li.appendChild(a);
      return li;
    }),
  );
}

function onProfileRecent() {
  const root = document.querySelector('.profile-page');
  if (!root) return;

  const slug = root.getAttribute('data-profile-slug');
  const title = root.getAttribute('data-profile-title');
  const path = root.getAttribute('data-profile-path');
  if (!slug || !title || !path) return;

  pushRecent({ slug, title, path });
  renderRecentList(slug);
}

onProfileRecent();
document.addEventListener('astro:page-load', onProfileRecent);
