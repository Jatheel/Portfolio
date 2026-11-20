// @ts-check
import { esc, each, section, isSet, joinSet } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */
/** @typedef {import('../data/types.js').Role} Role */

/**
 * Timeline entry drawn as a solder pad on a trace.
 * @param {Role} r @param {number} i
 */
export function timelineItem(r, i) {
  const where = joinSet([r.org, r.place, r.type]);
  return `<li class="timeline__item reveal" data-pad="${i}">
<span class="timeline__pad" aria-hidden="true"></span>
<div class="timeline__card card">
${isSet(r.period) ? `<p class="timeline__period">${esc(r.period)}</p>` : ''}
<h3 class="timeline__title">${esc(r.title)}</h3>
${where ? `<p class="timeline__org">${where}</p>` : ''}
<p class="timeline__desc">${esc(r.description)}</p>
</div>
</li>`;
}

/** @param {RenderContext} ctx */
export function renderExperience(ctx) {
  const body = `<ol class="timeline" role="list">
${each(ctx.data.experience, timelineItem)}
</ol>`;
  return section({
    id: 'experience',
    index: '04 / Teaching',
    title: 'Teaching experience',
    lead: `Since ${esc(ctx.data.profile.teachingSince)} I have taught mathematics, physics, IT and, now, Arduino robotics.`,
    body,
    layout: 'trace',
  });
}
