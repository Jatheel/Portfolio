// @ts-check
import {
  esc,
  each,
  section,
  isSet,
  confirmed,
  statusBadge,
  extLink,
  icon,
  CATEGORY_LABEL,
} from './util.js';
import { renderCaseStudies } from './caseStudy.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */
/** @typedef {import('../data/types.js').Project} Project */

/** @param {Project[]} projects */
function filterBar(projects) {
  const present = Object.keys(CATEGORY_LABEL).filter((c) => projects.some((p) => p.category === c));
  const chips = [['all', 'All'], ...present.map((c) => [c, CATEGORY_LABEL[c]])];
  // Hidden until JS enables filtering; without JS every card is simply shown.
  return `<div class="filters" data-filters hidden>
<p class="visually-hidden" id="filters-label">Filter projects by category</p>
<div class="filters__chips" role="group" aria-labelledby="filters-label">
${each(
  chips,
  ([value, label]) =>
    `<button type="button" class="chip chip--button" data-filter="${esc(value)}" aria-pressed="${value === 'all'}">${esc(label)}</button>`,
)}
</div>
<p class="filters__status visually-hidden" data-filter-status aria-live="polite"></p>
</div>`;
}

/**
 * @param {Project} p @param {RenderContext} ctx
 */
function card(p, ctx) {
  const cover = p.cover
    ? ctx.picture(`projects/${p.cover}`, `${p.title} screenshot`, 'project-card__cover')
    : '';
  const links = p.links.map((l) => extLink(l.url, l.label, 'link project-card__ext')).join('');
  return `<li class="project-card card card--trace reveal${p.featured ? ' project-card--featured' : ''}" data-project="${esc(p.id)}" data-category="${esc(p.category)}">
<article class="project-card__body" aria-labelledby="card-${esc(p.id)}">
${cover}
<header class="project-card__meta">
${statusBadge(p.status)}
<span class="project-card__cat">${esc(CATEGORY_LABEL[p.category])}</span>
${isSet(p.period) ? `<span class="project-card__period">${esc(p.period)}</span>` : ''}
</header>
<h3 class="project-card__title" id="card-${esc(p.id)}">${
    p.caseStudy
      ? `<a class="project-card__link" href="#project/${esc(p.id)}" data-open-project="${esc(p.id)}">${esc(p.title)}</a>`
      : esc(p.title)
  }</h3>
<p class="project-card__subtitle">${esc(p.subtitle)}</p>
<p class="project-card__summary">${esc(p.summary)}</p>
<ul class="tags" role="list" aria-label="Technologies">${each(confirmed(p.tech), (t) => `<li class="tag">${esc(t)}</li>`)}</ul>
<footer class="project-card__foot">
${p.caseStudy ? `<span class="project-card__cta" aria-hidden="true">Case study ${icon('arrow')}</span>` : ''}
${links}
</footer>
</article>
</li>`;
}

/** @param {RenderContext} ctx */
function upNextList(ctx) {
  const { site, upNext } = ctx.data;
  if (!site.showUpNext || !upNext.length) return '';
  return `<div class="up-next reveal">
<h3 class="eyebrow">Up next</h3>
<ul class="up-next__list" role="list">
${each(upNext, (u) => `<li>${statusBadge('planned')} <strong>${esc(u.title)}</strong> — ${esc(u.line)}</li>`)}
</ul>
</div>`;
}

/** @param {RenderContext} ctx */
export function renderProjects(ctx) {
  // Planned projects never sit among completed work.
  const shown = ctx.data.projects.filter((p) => p.status !== 'planned');
  const body = `${filterBar(shown)}
<ul class="projects" role="list" data-project-list>
${each(shown, (p) => card(p, ctx))}
</ul>
${upNextList(ctx)}
${renderCaseStudies(shown)}`;
  return section({
    id: 'projects',
    index: '03 / Projects',
    title: 'Projects',
    lead: 'Each project says whether it is completed or still in progress. Open one for the problem, my role, the approach and its limits.',
    body,
    layout: 'neural',
  });
}
