// @ts-check
import { esc, each, section, extLink, icon, asset } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/** @param {RenderContext} ctx */
export function renderContact(ctx) {
  const { profile } = ctx.data;
  const email = esc(profile.email);
  const phone =
    profile.showPhone && profile.phone
      ? `<li><a class="contact__link" href="tel:${esc(profile.phone.replace(/\s+/g, ''))}">${esc(profile.phone)}</a></li>`
      : '';

  const body = `<div class="contact reveal">
<p class="contact__lead">${esc(profile.availability)}. The quickest way to reach me is email.</p>
<div class="contact__email">
<a class="btn btn--primary" href="mailto:${email}">${icon('mail')} ${email}</a>
<button type="button" class="btn btn--ghost" data-copy-email="${email}" hidden>${icon('copy')} <span data-copy-label>Copy email</span></button>
<p class="visually-hidden" data-copy-status aria-live="polite"></p>
</div>
<ul class="contact__links" role="list">
<li>${extLink(profile.linkedin, 'LinkedIn', 'contact__link')}</li>
<li>${extLink(profile.github, 'GitHub', 'contact__link')}</li>
${phone}
</ul>
${
  ctx.availableCvs.length
    ? `<div class="contact__cvs">
<h3 class="eyebrow">Download my CV</h3>
<p class="contact__cv-buttons">${each(
        ctx.availableCvs,
        (cv) =>
          `<a class="btn btn--ghost" href="${esc(asset(cv.file))}" download>${icon('download')} ${esc(cv.label)} <span class="visually-hidden">(PDF)</span></a>`,
      )}</p>
</div>`
    : ''
}
</div>`;

  return section({
    id: 'contact',
    index: '08 / Contact',
    title: 'Contact',
    body,
    layout: 'antenna',
  });
}
