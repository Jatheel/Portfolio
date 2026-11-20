// @ts-check
import {
  esc,
  each,
  isSet,
  confirmed,
  statusBadge,
  extLink,
  icon,
  joinSet,
  CATEGORY_LABEL,
} from './util.js';

/** @typedef {import('../data/types.js').Project} Project */

/**
 * One titled block of the case study, or '' when it has no confirmed content.
 * @param {string} id @param {string} title @param {string} inner
 */
function block(id, title, inner) {
  if (!inner.trim()) return '';
  return `<section class="cs__block" aria-labelledby="${id}">
<h4 class="cs__h" id="${id}">${esc(title)}</h4>
${inner}
</section>`;
}

/** @param {unknown[]} items */
function bullets(items) {
  const list = confirmed(/** @type {any[]} */ (items ?? []));
  return list.length ? `<ul class="cs__list">${each(list, (i) => `<li>${esc(i)}</li>`)}</ul>` : '';
}

/** @param {unknown} text */
function para(text) {
  return isSet(text) ? `<p>${esc(text)}</p>` : '';
}

/** @param {string[]} [flow] */
function flowDiagram(flow) {
  if (!flow?.length) return '';
  return `<ol class="flow" aria-label="Request flow">${each(
    flow,
    (step, i) =>
      `<li class="flow__step">${esc(step)}</li>${i < flow.length - 1 ? '<li class="flow__arrow" aria-hidden="true">→</li>' : ''}`,
  )}</ol>`;
}

/**
 * A full case study. Rendered inline (readable without JS); the drawer moves it into a dialog.
 * @param {Project} p
 */
export function renderCaseStudy(p) {
  const cs = p.caseStudy;
  if (!cs) return '';
  const pid = esc(p.id);
  const links = p.links.map((l) => extLink(l.url, l.label, 'btn btn--ghost')).join('');
  return `<article class="cs" id="project/${pid}" data-case-study="${pid}" aria-labelledby="cs-${pid}-title">
<header class="cs__head">
<p class="cs__meta">${statusBadge(p.status)} <span>${joinSet([CATEGORY_LABEL[p.category], p.period])}</span></p>
<h3 class="cs__title" id="cs-${pid}-title" tabindex="-1">${esc(p.title)}</h3>
<p class="cs__subtitle">${esc(p.subtitle)}</p>
</header>
${block(`cs-${pid}-problem`, 'Problem', para(cs.problem))}
${block(`cs-${pid}-role`, 'My role', para(cs.role))}
${block(`cs-${pid}-approach`, 'Approach', bullets(cs.approach))}
${block(`cs-${pid}-arch`, 'Architecture', `${para(cs.architecture)}${flowDiagram(cs.architectureFlow)}`)}
${block(`cs-${pid}-testing`, 'Testing', para(cs.testing))}
${block(`cs-${pid}-limits`, 'Limitations', bullets(cs.limitations))}
${block(`cs-${pid}-next`, 'Next', bullets(cs.next))}
${block(`cs-${pid}-tech`, 'Tech', `<ul class="tags" role="list">${each(confirmed(p.tech), (t) => `<li class="tag">${esc(t)}</li>`)}</ul>`)}
${links ? block(`cs-${pid}-links`, 'Links', `<p class="cs__links">${links}</p>`) : ''}
${cs.credit ? `<p class="cs__credit">${esc(cs.credit)}</p>` : ''}
<p class="cs__back"><a class="link" href="#projects" data-close-panel>${icon('arrow')} Back to projects</a></p>
</article>`;
}

/** @param {Project[]} projects */
export function renderCaseStudies(projects) {
  const withCs = projects.filter((p) => p.caseStudy);
  if (!withCs.length) return '';
  return `<div class="case-studies" data-case-studies>
<h3 class="case-studies__title">Case studies</h3>
${each(withCs, renderCaseStudy)}
</div>`;
}
