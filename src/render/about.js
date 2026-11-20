// @ts-check
import { esc, each, section, isSet, joinSet } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/**
 * Monogram on a chip outline; used until a photo is confirmed.
 * @param {string} initials
 */
export function monogram(initials) {
  const pins = [18, 34, 50, 66, 82]
    .map(
      (p) =>
        `<line x1="${p}" y1="4" x2="${p}" y2="14"/><line x1="${p}" y1="86" x2="${p}" y2="96"/><line x1="4" y1="${p}" x2="14" y2="${p}"/><line x1="86" y1="${p}" x2="96" y2="${p}"/>`,
    )
    .join('');
  return `<svg class="monogram" viewBox="0 0 100 100" width="120" height="120" role="img" aria-label="${esc(initials)} monogram">
<g class="monogram__pins">${pins}</g>
<rect class="monogram__body" x="14" y="14" width="72" height="72" rx="8"/>
<circle class="monogram__notch" cx="26" cy="26" r="3"/>
<text class="monogram__text" x="50" y="58" text-anchor="middle">${esc(initials)}</text>
</svg>`;
}

/**
 * @param {RenderContext} ctx
 */
function avatar(ctx) {
  const { profile } = ctx.data;
  const img = isSet(profile.photo)
    ? ctx.picture(String(profile.photo), profile.name, 'about__photo')
    : '';
  return img || monogram(profile.initials);
}

/** @param {RenderContext} ctx */
export function renderAbout(ctx) {
  const { profile, education } = ctx.data;
  const body = `<div class="about">
<div class="about__text reveal">
${each(profile.about, (p) => `<p>${esc(p)}</p>`)}
<h3 class="eyebrow">Focus areas</h3>
<ul class="chips" role="list">${each(profile.focusAreas, (f) => `<li class="chip">${esc(f)}</li>`)}</ul>
${isSet(profile.location) ? `<p class="about__location">Based in ${esc(profile.location)}</p>` : ''}
</div>
<aside class="about__side reveal" aria-label="Education">
<div class="about__avatar">${avatar(ctx)}</div>
<div class="card card--edu">
<h3 class="eyebrow">Education</h3>
<ol class="edu" role="list">
${each(
  education,
  (e) => `<li class="edu__item">
<p class="edu__title">${esc(e.title)}</p>
${e.institution ? `<p class="edu__inst">${esc(e.institution)}</p>` : ''}
${isSet(e.detail) ? `<p class="edu__detail">${esc(e.detail)}</p>` : ''}
${joinSet([e.school, e.year]) ? `<p class="edu__detail">${joinSet([e.school, e.year])}</p>` : ''}
${isSet(e.expectedGraduation) ? `<p class="edu__detail">Expected graduation ${esc(e.expectedGraduation)}</p>` : ''}
</li>`,
)}
</ol>
</div>
</aside>
</div>`;
  return section({ id: 'about', index: '01 / About', title: 'About', body, layout: 'chip' });
}
