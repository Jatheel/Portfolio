// @ts-check
import { esc, each, icon, asset } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/**
 * Hero numbers are computed from the data so they cannot drift from the truth.
 * @param {RenderContext} ctx
 */
export function heroStats(ctx) {
  const { projects, profile, nowBuilding } = ctx.data;
  return [
    {
      value: projects.filter((p) => p.status === 'completed').length,
      label: 'completed projects',
    },
    { value: Math.max(0, ctx.year - profile.teachingSince), label: 'years teaching' },
    { value: nowBuilding.dataset.classes, label: 'component classes in training data' },
  ];
}

/** @param {RenderContext} ctx */
export function renderHero(ctx) {
  const { profile } = ctx.data;
  const [firstRole] = profile.roles;
  const cv = ctx.availableCvs[0];

  return `<section class="hero" id="hero" aria-labelledby="hero-title" data-layout="board">
<div class="hero__inner">
<p class="hero__eyebrow"><span class="pulse-dot" aria-hidden="true"></span>${esc(profile.availability)}</p>
<h1 class="hero__title" id="hero-title">${esc(profile.name)}</h1>
<p class="hero__role">${esc(profile.title)}</p>
<p class="hero__intro">${esc(profile.intro)}</p>
<p class="hero__rotator">I build
<span class="rotator" data-rotator data-words="${esc(JSON.stringify(profile.roles))}" aria-hidden="true">${esc(firstRole)}</span>
<span class="visually-hidden">${esc(profile.roles.join(', '))}</span></p>
<div class="hero__ctas">
<a class="btn btn--primary" href="#projects">See projects ${icon('arrow')}</a>
${cv ? `<a class="btn btn--ghost" href="${esc(asset(cv.file))}" download>Download CV ${icon('download')}</a>` : `<a class="btn btn--ghost" href="#contact">Get in touch ${icon('mail')}</a>`}
</div>
<dl class="stats">
${each(
  heroStats(ctx),
  (s) => `<div class="stat">
<dt class="stat__label">${esc(s.label)}</dt>
<dd class="stat__value" data-count="${s.value}">${s.value}</dd>
</div>`,
)}
</dl>
</div>
</section>`;
}
