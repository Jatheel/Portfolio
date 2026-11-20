// @ts-check
import { esc } from './util.js';

/**
 * @typedef {{ w: number, h: number, widths: number[] }} ImageEntry
 * @typedef {Record<string, ImageEntry>} ImageManifest  keys like "projects/smartdesk"
 */

/**
 * Build a <picture> with AVIF + WebP sources from the image manifest, or '' if the image
 * has not been generated yet (so callers can hide the item).
 * @param {ImageManifest} manifest
 * @param {string} id @param {string} alt @param {string} [cls]
 * @param {{ eager?: boolean, sizes?: string }} [opts]
 */
export function picture(manifest, id, alt, cls = '', opts = {}) {
  const entry = manifest[id];
  if (!entry || !entry.widths?.length) return '';
  const sizes = opts.sizes ?? '(min-width: 960px) 40vw, 92vw';
  const set = (/** @type {string} */ ext) =>
    entry.widths.map((w) => `./img/${esc(id)}-${w}.${ext} ${w}w`).join(', ');
  const fallbackW = entry.widths.find((w) => w >= 800) ?? entry.widths[entry.widths.length - 1];
  return `<picture class="${esc(cls)}">
<source type="image/avif" srcset="${set('avif')}" sizes="${esc(sizes)}">
<img src="./img/${esc(id)}-${fallbackW}.webp" srcset="${set('webp')}" sizes="${esc(sizes)}" width="${entry.w}" height="${entry.h}" alt="${esc(alt)}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
</picture>`;
}

/**
 * URL of the largest generated WebP, used for lightbox links.
 * @param {ImageManifest} manifest @param {string} id
 */
export function largestSrc(manifest, id) {
  const entry = manifest[id];
  if (!entry) return '';
  return `./img/${esc(id)}-${entry.widths[entry.widths.length - 1]}.webp`;
}
