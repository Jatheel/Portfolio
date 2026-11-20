// @ts-check
import { esc, each, section, isSet, statusBadge, extLink, icon, safeUrl } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

const STATE_LABEL = /** @type {Record<string, string>} */ ({
  done: 'Done',
  active: 'In progress',
  todo: 'To do',
});

/**
 * Progress is shown only when every step state is confirmed — no guessed percentages.
 * @param {RenderContext['data']['nowBuilding']['steps']} steps
 */
export function stepProgress(steps) {
  const required = steps.filter((s) => !s.optional);
  if (!required.length || !required.every((s) => isSet(s.state))) return null;
  const done = required.filter((s) => s.state === 'done').length;
  return { done, total: required.length };
}

/** @param {RenderContext} ctx */
export function renderNow(ctx) {
  const nb = ctx.data.nowBuilding;
  const progress = stepProgress(nb.steps);
  const demo =
    nb.demoLive && safeUrl(nb.demoUrl)
      ? `<a class="btn btn--primary" href="${safeUrl(nb.demoUrl)}" target="_blank" rel="noopener noreferrer">Try the live demo ${icon('external')}<span class="visually-hidden"> (opens in a new tab)</span></a>`
      : '';

  const body = `<article class="now card card--trace reveal" data-project="${esc(nb.projectId)}" aria-labelledby="now-project">
<header class="now__head">
${statusBadge(nb.status)}
<p class="now__meta">Started ${esc(nb.started)}</p>
</header>
<h3 class="now__title" id="now-project">${esc(nb.title)}</h3>
<p class="now__line">${esc(nb.line)}</p>
<ul class="now__facts" role="list">
<li><span class="mono">${esc(nb.dataset.images.toLocaleString('en-GB'))}</span> images</li>
<li><span class="mono">${esc(nb.dataset.classes)}</span> classes</li>
<li><span class="mono">${esc(nb.dataset.name)}</span> · ${esc(nb.dataset.licence)}</li>
</ul>
${
  progress
    ? `<div class="now__progress">
<label for="now-progress" class="eyebrow">Progress · ${progress.done} of ${progress.total} steps</label>
<progress id="now-progress" max="${progress.total}" value="${progress.done}">${progress.done} of ${progress.total}</progress>
</div>`
    : ''
}
<h4 class="eyebrow">Steps</h4>
<ol class="steps" role="list">
${each(nb.steps, (s, i) => {
  const state = isSet(s.state) ? String(s.state) : '';
  return `<li class="step${state ? ` step--${state}` : ''}">
<span class="step__pad" aria-hidden="true">${state === 'done' ? icon('check') : String(i + 1).padStart(2, '0')}</span>
<span class="step__label">${esc(s.label)}${s.optional ? ' <span class="step__opt">(optional)</span>' : ''}</span>
${state ? `<span class="step__state">${STATE_LABEL[state]}</span>` : ''}
</li>`;
})}
</ol>
<div class="now__actions">
${demo}
${extLink(nb.modelUrl, 'Model on Hugging Face', 'btn btn--ghost')}
${extLink(nb.repoUrl, 'Source on GitHub', 'btn btn--ghost')}
<a class="btn btn--ghost" href="#project/${esc(nb.projectId)}" data-open-project="${esc(nb.projectId)}">Read the case study ${icon('arrow')}</a>
</div>
</article>`;

  return section({
    id: 'now',
    index: '02 / Now',
    title: 'Now building',
    lead: 'The project on my desk right now, and the steps it goes through.',
    body,
    layout: 'detect',
  });
}
