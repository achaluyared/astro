import type { ImageMetadata } from 'astro';
import type { Profile } from './data';

// Only originals that exist on disk are globbed, so missing WordPress files
// (8 are referenced by profiles but absent from uploads) are skipped cleanly.
const modules = import.meta.glob<{ default: ImageMetadata }>('/src/assets/uploads/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}');

export async function loadImage(file: string): Promise<ImageMetadata | null> {
  const loader = modules[`/src/assets/uploads/${file}`];
  return loader ? (await loader()).default : null;
}

export const hasImage = (file: string) => `/src/assets/uploads/${file}` in modules;

/** Profile images that exist on disk, primary first. */
export function availableImages(p: Profile) {
  const list = p.images.filter((i) => hasImage(i.file));
  const primary = list.findIndex((i) => i.primary);
  if (primary > 0) list.unshift(...list.splice(primary, 1));
  return list;
}

export function primaryImage(p: Profile) {
  return availableImages(p)[0] ?? null;
}
