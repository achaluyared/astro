/**
 * Rewrite absurd / legacy upload paths to short on-disk names (Windows MAX_PATH, SEO).
 * Keep in sync with Addis_Headless_API::fix_image_file() in wp-plugin.
 */
export const PROFILE_IMAGE_FILE_FIXES = {
  '2026/03/joint-knee-lady-lamp-lampshade-leg-light-fixture-lighting-linens-lingerie-living-room-long-hair-model-mouth-muscle-nap-photo-shoot-pillow-pretty-room-sexy-shoulder-sitting-thigh-throw-pillow-trunk-undergarment-woman-.jpg':
    '2026/03/yordanos-primary.jpg',
};

export function fixProfileImageFile(rel) {
  return PROFILE_IMAGE_FILE_FIXES[rel] ?? rel;
}

export function applyProfileImageFixes(profiles) {
  for (const p of profiles) {
    for (const img of p.images ?? []) {
      img.file = fixProfileImageFile(img.file);
    }
  }
  return profiles;
}
