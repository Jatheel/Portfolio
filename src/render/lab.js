// @ts-check
import { esc, each, section, isSet } from './util.js';
import { largestSrc } from './picture.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/** @param {RenderContext} ctx */
export function renderLab(ctx) {
  const { lab } = ctx.data;
  // Items without a confirmed, generated image are hidden from the gallery.
  const shots = lab
    .filter((l) => isSet(l.image))
    .map((l) => ({ ...l, id: `lab/${String(l.image)}` }))
    .filter((l) => ctx.images[l.id]);

  const gallery = shots.length
    ? `<ul class="gallery" role="list" data-gallery>
${each(
  shots,
  (s) => `<li class="gallery__item reveal">
<figure>
<a class="gallery__link" href="${largestSrc(ctx.images, s.id)}" data-lightbox aria-label="Enlarge photo: ${esc(s.title)}">
${ctx.picture(s.id, s.title, 'gallery__img', { sizes: '(min-width: 960px) 30vw, 92vw' })}
</a>
<figcaption>${esc(s.title)}</figcaption>
</figure>
</li>`,
)}
</ul>`
    : '';

  const body = `${gallery}
<div class="lab-list reveal">
<h3 class="eyebrow">Practicals I teach</h3>
<ul class="chips" role="list">${each(lab, (l) => `<li class="chip chip--pad">${esc(l.title)}</li>`)}</ul>
</div>`;

  return section({
    id: 'lab',
    index: '07 / Lab',
    title: 'Arduino lab',
    lead: 'Beginner Arduino practicals from the robotics classes I teach.',
    body,
    layout: 'board',
  });
}
