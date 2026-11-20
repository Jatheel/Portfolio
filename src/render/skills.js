// @ts-check
import { esc, each, section } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/** @param {RenderContext} ctx */
export function renderSkills(ctx) {
  const body = `<p class="legend reveal">
<span class="legend__item"><span class="skill skill--used" aria-hidden="true">Aa</span> Used in projects</span>
<span class="legend__item"><span class="skill skill--exposure" aria-hidden="true">Aa</span> Exposure — learning or used briefly</span>
</p>
<ul class="skill-groups" role="list">
${each(
  ctx.data.skills,
  (g, i) => `<li class="skill-group card reveal" data-skill-group="${i}">
<h3 class="skill-group__title"><span class="skill-group__ring" aria-hidden="true"></span>${esc(g.name)}</h3>
<ul class="skills" role="list">
${each(
  g.skills,
  (s) =>
    `<li class="skill skill--${s.level}">${esc(s.name)}${s.note ? ` <span class="skill__note">(${esc(s.note)})</span>` : ''}${s.level === 'exposure' ? '<span class="visually-hidden"> — exposure</span>' : ''}</li>`,
)}
</ul>
</li>`,
)}
</ul>`;
  return section({ id: 'skills', index: '06 / Skills', title: 'Skills', body, layout: 'rings' });
}
