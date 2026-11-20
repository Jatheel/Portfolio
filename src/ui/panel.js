// @ts-check
/**
 * Case-study drawer. Case studies are rendered inline at build time (readable without JS);
 * here each one is moved into a modal <dialog> when its hash (#project/<id>) is active.
 * showModal() makes the rest of the page inert, so focus stays inside; Esc closes;
 * the back button closes; focus returns to the card that opened it.
 */
const PREFIX = '#project/';

/** @param {{ onChange?: (id: string | null) => void }} [opts] */
export function initPanel(opts = {}) {
  const found = document.querySelector('[data-panel]');
  const content = document.querySelector('[data-panel-content]');
  const store = document.querySelector('[data-case-studies]');
  if (!(found instanceof HTMLDialogElement) || !content || !store) return;
  const dialog = found;

  /** @type {HTMLElement | null} */ let current = null;
  /** @type {Comment | null} */ let marker = null;
  /** @type {HTMLElement | null} */ let returnTo = null;
  let pushedHistory = false;

  /** @param {string} id */
  const findCaseStudy = (id) =>
    /** @type {HTMLElement | undefined} */ (
      [...store.querySelectorAll('[data-case-study]')].find(
        (el) => /** @type {HTMLElement} */ (el).dataset.caseStudy === id,
      )
    );

  /** @param {string} id */
  const cardLink = (id) =>
    /** @type {HTMLElement | null} */ (
      // Prefer the project card's own link over other "read the case study" links
      // (querySelectorAll returns document order, so search the cards first).
      [
        ...document.querySelectorAll('.project-card__link[data-open-project]'),
        ...document.querySelectorAll('[data-open-project]'),
      ].find((el) => /** @type {HTMLElement} */ (el).dataset.openProject === id) ?? null
    );

  function putBack() {
    if (current && marker) marker.replaceWith(current);
    current = null;
    marker = null;
  }

  /** @param {string} id */
  function open(id) {
    const article = findCaseStudy(id);
    if (!article) return;
    if (current !== article) {
      putBack();
      marker = document.createComment('case-study');
      article.replaceWith(marker);
      content.append(article);
      current = article;
    }
    const title = article.querySelector('.cs__title');
    if (title?.id) dialog.setAttribute('aria-labelledby', title.id);
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('panel-open');
    dialog.scrollTop = 0;
    /** @type {HTMLElement | null} */ (title)?.focus();
    opts.onChange?.(id);
  }

  function route() {
    const hash = decodeURIComponent(location.hash);
    if (hash.startsWith(PREFIX)) open(hash.slice(PREFIX.length));
    else if (dialog.open) dialog.close();
  }

  // Remember which control opened the drawer, and that the click added a history entry.
  document.addEventListener('click', (e) => {
    const link = /** @type {HTMLElement} */ (e.target).closest('[data-open-project]');
    if (!(link instanceof HTMLElement)) return;
    returnTo = link;
    pushedHistory = location.hash !== `${PREFIX}${link.dataset.openProject}`;
  });

  dialog.querySelector('[data-panel-close]')?.addEventListener('click', () => dialog.close());
  // Clicking the backdrop (outside the drawer box) closes it.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    const id = current?.dataset.caseStudy ?? null;
    putBack();
    document.documentElement.classList.remove('panel-open');
    if (location.hash.startsWith(PREFIX)) {
      if (pushedHistory) history.back();
      else history.replaceState(null, '', '#projects');
    }
    pushedHistory = false;
    (returnTo ?? (id ? cardLink(id) : null))?.focus({ preventScroll: false });
    returnTo = null;
    opts.onChange?.(null);
  });

  window.addEventListener('hashchange', route);
  if (location.hash.startsWith(PREFIX)) {
    returnTo = cardLink(decodeURIComponent(location.hash).slice(PREFIX.length));
    route();
  }
}
