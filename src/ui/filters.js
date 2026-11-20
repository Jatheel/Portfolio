// @ts-check
/** Category filter for project cards; the bar stays hidden without JS. */
export function initFilters() {
  const bar = document.querySelector('[data-filters]');
  const cards = /** @type {HTMLElement[]} */ ([
    ...document.querySelectorAll('[data-project-list] > [data-category]'),
  ]);
  const status = document.querySelector('[data-filter-status]');
  if (!(bar instanceof HTMLElement) || !cards.length) return;

  const buttons = /** @type {HTMLButtonElement[]} */ ([...bar.querySelectorAll('[data-filter]')]);
  bar.hidden = false;

  /** @param {string} value */
  function select(value) {
    let shown = 0;
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.filter === value));
    for (const card of cards) {
      const match = value === 'all' || card.dataset.category === value;
      card.classList.toggle('is-filtered-out', !match);
      if (match) shown += 1;
    }
    if (status) status.textContent = `Showing ${shown} project${shown === 1 ? '' : 's'}`;
  }

  bar.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest('[data-filter]');
    if (btn instanceof HTMLButtonElement) select(btn.dataset.filter ?? 'all');
  });
}
