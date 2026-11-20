// @ts-check
import { each, section } from './util.js';
import { timelineItem } from './experience.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/** @param {RenderContext} ctx */
export function renderLeadership(ctx) {
  const offset = ctx.data.experience.length;
  const body = `<ol class="timeline timeline--leadership" role="list">
${each(ctx.data.leadership, (r, i) => timelineItem(r, offset + i))}
</ol>`;
  return section({
    id: 'leadership',
    index: '05 / Leadership',
    title: 'Leadership',
    body,
    layout: 'trace',
  });
}
