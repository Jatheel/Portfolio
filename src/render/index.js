// @ts-check
/** Entry for build-time rendering: data in, HTML strings out. Pure — no DOM, no fs. */
import { esc, icon } from './util.js';
import { picture } from './picture.js';
import { renderHero } from './hero.js';
import { renderAbout } from './about.js';
import { renderNow } from './now.js';
import { renderProjects } from './projects.js';
import { renderExperience } from './experience.js';
import { renderLeadership } from './leadership.js';
import { renderSkills } from './skills.js';
import { renderLab } from './lab.js';
import { renderContact } from './contact.js';
import { renderHead, renderSitemap, renderRobots, siteUrl } from './head.js';

export { renderHead, renderSitemap, renderRobots, siteUrl };

/**
 * @typedef {typeof import('../data/profile.js')} ProfileData
 * @typedef {Object} RenderContext
 * @property {ProfileData} data
 * @property {number} year          build year, used for derived stats and the footer
 * @property {string} today         ISO date for the sitemap
 * @property {import('../data/types.js').Cv[]} availableCvs  CVs whose PDF exists
 * @property {import('./picture.js').ImageManifest} images
 * @property {(id: string, alt: string, cls?: string, opts?: { eager?: boolean, sizes?: string }) => string} picture
 */

/**
 * @param {ProfileData} data
 * @param {{ year?: number, today?: string, availableCvs?: import('../data/types.js').Cv[], images?: import('./picture.js').ImageManifest }} [opts]
 * @returns {RenderContext}
 */
export function createContext(data, opts = {}) {
  const images = opts.images ?? {};
  const now = new Date();
  return {
    data,
    year: opts.year ?? now.getFullYear(),
    today: opts.today ?? now.toISOString().slice(0, 10),
    availableCvs: opts.availableCvs ?? [],
    images,
    picture: (id, alt, cls, o) => picture(images, id, alt, cls, o),
  };
}

export const NAV = [
  ['about', 'About'],
  ['now', 'Now'],
  ['projects', 'Projects'],
  ['experience', 'Teaching'],
  ['skills', 'Skills'],
  ['lab', 'Lab'],
  ['contact', 'Contact'],
];

/** @param {RenderContext} ctx */
export function renderHeader(ctx) {
  const { profile } = ctx.data;
  return `<header class="site-header">
<div class="site-header__inner">
<a class="brand" href="#hero"><span class="brand__chip" aria-hidden="true">${esc(profile.initials)}</span><span class="brand__name">${esc(profile.name)}</span></a>
<nav class="nav" aria-label="Sections">
<ul class="nav__list" role="list">
${NAV.map(([id, label]) => `<li><a class="nav__link" href="#${id}" data-nav="${id}">${label}</a></li>`).join('')}
</ul>
</nav>
<button type="button" class="theme-toggle" data-theme-toggle hidden aria-label="Switch to dark theme">${icon('moon')}${icon('sun')}</button>
</div>
</header>`;
}

/** @param {RenderContext} ctx */
export function renderSections(ctx) {
  return [
    renderHero(ctx),
    renderAbout(ctx),
    renderNow(ctx),
    renderProjects(ctx),
    renderExperience(ctx),
    renderLeadership(ctx),
    renderSkills(ctx),
    renderLab(ctx),
    renderContact(ctx),
  ].join('\n');
}

/** Dialog shells filled by JS; closed dialogs are invisible without JS. */
export function renderDialogs() {
  return `<dialog class="panel" data-panel aria-modal="true">
<div class="panel__bar"><button type="button" class="panel__close" data-panel-close aria-label="Close case study">${icon('close')}</button></div>
<div class="panel__content" data-panel-content></div>
</dialog>
<dialog class="lightbox" data-lightbox-dialog aria-modal="true" aria-label="Photo">
<button type="button" class="panel__close lightbox__close" data-lightbox-close aria-label="Close photo">${icon('close')}</button>
<figure class="lightbox__figure" data-lightbox-figure></figure>
</dialog>`;
}

/** @param {RenderContext} ctx */
export function renderFooter(ctx) {
  const { site, profile } = ctx.data;
  return `<footer class="site-footer">
<div class="site-footer__inner">
<p>${esc(site.footer.replace('{year}', String(ctx.year)))}</p>
<p><a class="link" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a></p>
</div>
</footer>`;
}
