# UI design reference (PremiumPress headless brands)

Handoff doc for the Tailwind frontend. **Production CSS** lives in `src/styles/` until migration.  
Multi-site WordPress + deploy: **[../HEADLESS.md](../HEADLESS.md)**.

## Brand

- **Mood:** Dark VIP directory, mobile-first, discreet, premium (not generic template).
- **Primary gold:** `#c9a45c` (`--gold`), accent `#f0b429` (`--brand-gold`).
- **Backgrounds:** `#0f0d10` (page), `#1a171c` (panels).
- **Type:** Georgia / serif for **headings**; system UI sans for body (see `global.css`).

## Layout

- **Max width:** 1180px (`--max`, class `.wrap`).
- **Listing grid:** 2 cols ≤620px → 3 cols ≤900px → 4 cols desktop (`.profile-grid`).
- **Profile:** Match **addisvipgirls.com** layout (`samira-proposal-a.html` / section map). Gallery first on mobile; **non-sticky** sidebar in the top grid row on desktop (`align-self: start` only); bottom dock on mobile. Do **not** copy `lg:sticky` from Tailwind/DaisyUI mockups unless production VIP changes.

## Core components (reuse in rebuild)

| Component | File |
|-----------|------|
| Site shell | `layouts/Base.astro` |
| Listing card | `components/ProfileCard.astro` |
| Grid + filters | `components/ProfileGrid.astro` |
| Home sections | `components/ProfileSection.astro` |
| Profile badges | `components/ProfileStatusBadges.astro` |
| Age gate | `components/AgeGate.astro` |
| Trust line | `components/TrustNotice.astro` |

## Listing badges (VIP cards)

- **Verified / Gold / VIP** — PremiumPress badge IDs on the listing (`badges.json` catalog + `profile.badges`).
- **Not** the `verified` post-meta flag alone (can disagree with manual badge assignment).
- **New** — published within the last **15 days** (`publishedAt`; not the homepage package flag).
- Max **2** badges on listing photos; no Featured/Sponsored/Homepage pills on cards.

Search filters: **Verified / Featured / Popular / New** (Popular = sponsored).

Sort on search/archives: sponsored → featured → homepage → rest.

## Mockups

- Plain CSS profile: `public/mockups/samira-proposal-a.html`
- Tailwind: `public/mockups/tailwind-proposal.html`, `tailwind-proposal-profile.html`
- DaisyUI: `public/mockups/daisyui-proposal.html`, `daisyui-proposal-profile.html`

## Client storage keys (do not rename)

- `addis_age_ok` — age gate (60 days)
- `addis_recent` — recently viewed slugs (`lib/storage.ts`)

## Stack (in repo)

- **Tailwind CSS v4** — `@tailwindcss/vite`, theme in `src/styles/tailwind.css` (`vip-*` colors).
- **Astro `.astro`** — pages and components (no React).
- **GLightbox** — profile fullscreen gallery (`src/scripts/profile-glightbox.ts`).
- **Fontsource** — Cormorant Garamond (headings), Inter (body), loaded in `Base.astro`.
- **Lucide** — `LucideIcon.astro` (e.g. menu icon); extend as needed.
- **View Transitions** — `ClientRouter` in `Base.astro`.

Legacy layout CSS remains in `global.css` / `profile.css` during gradual migration to Tailwind utilities.
