// @ts-check
/** Pure string helpers shared by every renderer. No DOM access. */
import { TO_CONFIRM, isSet } from '../data/confirm.js';

export { isSet, TO_CONFIRM };

const ESCAPES = /** @type {Record<string, string>} */ ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

/**
 * Escape text for HTML content and quoted attributes. Unconfirmed or missing values render as ''.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (!isSet(value) || typeof value === 'symbol') return '';
  return String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

export const esc = escapeHtml;

/**
 * Only allow https:, mailto: and same-site relative URLs; anything else becomes ''.
 * @param {unknown} url
 */
export function safeUrl(url) {
  if (!isSet(url) || typeof url !== 'string') return '';
  const u = url.trim();
  if (/^https:\/\//i.test(u) || /^mailto:[^\s]+$/i.test(u)) return escapeHtml(u);
  if (/^(#|\.\/|\/(?!\/))/.test(u)) return escapeHtml(u);
  return '';
}

/**
 * Turn a site-root path (/cv/x.pdf) into a base-relative one (./cv/x.pdf) so `base: './'` works.
 * @param {string} p
 */
export function asset(p) {
  return p.startsWith('/') ? `.${p}` : p;
}

/**
 * Keep only confirmed values.
 * @template T
 * @param {Array<T | symbol>} list
 * @returns {T[]}
 */
export function confirmed(list = []) {
  return /** @type {T[]} */ (list.filter(isSet));
}

/**
 * Render each item and join.
 * @template T
 * @param {T[]} items @param {(item: T, index: number) => string} fn
 */
export function each(items, fn) {
  return items.map(fn).join('');
}

/**
 * Join confirmed parts with a separator, escaping each.
 * @param {unknown[]} parts @param {string} [sep]
 */
export function joinSet(parts, sep = ' · ') {
  return parts
    .filter(isSet)
    .map((p) => escapeHtml(p))
    .join(sep);
}

/**
 * External link with safe rel attributes. Returns '' if the URL is unconfirmed or unsafe.
 * @param {unknown} url @param {string} label @param {string} [cls]
 */
export function extLink(url, label, cls = 'link') {
  const href = safeUrl(url);
  if (!href) return '';
  return `<a class="${cls}" href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
}

/** Status words exactly as shown on badges. */
export const STATUS_LABEL = /** @type {const} */ ({
  completed: 'Completed',
  ongoing: 'Ongoing',
  planned: 'Planned',
});

export const CATEGORY_LABEL = /** @type {const} */ ({
  cv: 'Computer Vision',
  genai: 'GenAI',
  fullstack: 'Full-stack',
  automation: 'Automation',
  hardware: 'Hardware',
});

/** @param {'completed'|'ongoing'|'planned'} status */
export function statusBadge(status) {
  return `<span class="badge badge--${status}"><span class="badge__dot" aria-hidden="true"></span>${STATUS_LABEL[status]}</span>`;
}

/**
 * Section wrapper with a mono index label and heading.
 * @param {{ id: string, index: string, title: string, body: string, lead?: string, layout: string }} o
 */
export function section({ id, index, title, body, lead = '', layout }) {
  return `<section class="section section--${id}" id="${id}" aria-labelledby="${id}-title" data-layout="${layout}">
<div class="section__inner">
<header class="section__head reveal">
<p class="section__index" aria-hidden="true">${esc(index)}</p>
<h2 class="section__title" id="${id}-title">${esc(title)}</h2>
${lead ? `<p class="section__lead">${esc(lead)}</p>` : ''}
</header>
${body}
</div>
</section>`;
}

/**
 * Small inline icons drawn for this site (24×24 grid, stroke only).
 * @param {'arrow'|'download'|'mail'|'copy'|'external'|'close'|'sun'|'moon'|'check'} name
 */
export function icon(name) {
  const paths = {
    arrow: 'M5 12h13M13 6l6 6-6 6',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
    copy: 'M9 9h10v11H9zM5 15V4h10',
    external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
    close: 'M6 6l12 12M18 6L6 18',
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
    moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
    check: 'M5 12l5 5 9-10',
  };
  return `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;
}
