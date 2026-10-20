import { isNewlyPublished, type Profile } from './data';
import badgesRaw from '../data/badges.json';

export type BadgeRole = 'gold' | 'vip' | 'verified' | 'other';

export type BadgeDefinition = {
  id: number;
  name: string;
  role: BadgeRole;
};

export type PhotoBadgeKind = 'verified' | 'gold' | 'vip' | 'new';

const catalog: BadgeDefinition[] = Array.isArray((badgesRaw as { badges?: unknown }).badges)
  ? ((badgesRaw as { badges: BadgeDefinition[] }).badges ?? [])
  : [];

const byId = new Map<number, BadgeDefinition>(catalog.map((b) => [b.id, b]));

/** When badges.json is missing a PP index still assigned on listings. */
const FALLBACK_ROLE: Record<number, BadgeRole> = {
  0: 'gold',
  1: 'verified',
  2: 'vip',
  3: 'vip',
};

function roleForBadgeId(id: number): BadgeRole {
  return byId.get(id)?.role ?? FALLBACK_ROLE[id] ?? 'other';
}

const PHOTO_BADGE_ORDER: PhotoBadgeKind[] = ['verified', 'gold', 'vip', 'new'];

/** True when the escort has PremiumPress “Verified” (or equivalent) badge assigned. */
export function profileHasVerifiedBadge(p: Profile): boolean {
  return p.badges.some((id) => roleForBadgeId(id) === 'verified');
}

/**
 * Badges on listing photos (VIP): from PremiumPress badge IDs + optional “New”.
 * Does not use flags.verified (often out of sync with manual badge assignment).
 */
export function profilePhotoBadges(p: Profile, max = 2): PhotoBadgeKind[] {
  const kinds = new Set<PhotoBadgeKind>();

  for (const id of p.badges) {
    const role = roleForBadgeId(id);
    if (role === 'verified' || role === 'gold' || role === 'vip') kinds.add(role);
  }

  if (isNewlyPublished(p)) kinds.add('new');

  const out: PhotoBadgeKind[] = [];
  for (const kind of PHOTO_BADGE_ORDER) {
    if (kinds.has(kind)) out.push(kind);
    if (out.length >= max) break;
  }
  return out;
}

export function photoBadgeLabel(kind: PhotoBadgeKind): string {
  switch (kind) {
    case 'verified':
      return 'Verified';
    case 'gold':
      return 'Gold';
    case 'vip':
      return 'VIP';
    case 'new':
      return 'New';
  }
}

/** Prefer synced PP badge name (e.g. “VIP Gold”) when available. */
export function photoBadgeLabelForProfile(p: Profile, kind: PhotoBadgeKind): string {
  for (const id of p.badges) {
    if (roleForBadgeId(id) !== kind) continue;
    const name = byId.get(id)?.name?.trim();
    if (name) return name;
  }
  return photoBadgeLabel(kind);
}

/** Profile detail page — same rules, no 2-badge cap. */
export function profileDetailBadges(p: Profile): PhotoBadgeKind[] {
  return profilePhotoBadges(p, 8);
}
