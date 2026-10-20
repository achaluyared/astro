import type { Profile } from './data';

/** Stable key for ?city= URL filter (ASCII slug from WP city name). */
export function cityFilterKey(p: Profile): string {
  const raw = p.location.city?.trim() || p.location.state?.trim() || '';
  if (!raw) return '';
  return raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export type SearchCityOption = { key: string; label: string; count: number };

/** Cities present in the profile set (for search dropdown). */
export function searchCityOptions(profiles: Profile[]): SearchCityOption[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const p of profiles) {
    const label = p.location.city?.trim() || p.location.state?.trim() || '';
    if (!label) continue;
    const key = cityFilterKey(p) || label.toLowerCase();
    const prev = map.get(key);
    if (prev) prev.count++;
    else map.set(key, { label, count: 1 });
  }
  return [...map.entries()]
    .map(([key, { label, count }]) => ({ key, label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
