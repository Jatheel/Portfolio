// @ts-check
/** Marks the nav link of the section currently in view. */
export function initNav() {
  const links = new Map(
    [...document.querySelectorAll('[data-nav]')].map((a) => [
      /** @type {HTMLElement} */ (a).dataset.nav,
      a,
    ]),
  );
  // Leadership belongs to the "Teaching" nav item.
  const alias = /** @type {Record<string, string>} */ ({ leadership: 'experience' });
  const sections = [...document.querySelectorAll('main > section[id]')];
  if (!sections.length || !('IntersectionObserver' in window)) return;

  /** @param {string} id */
  const setCurrent = (id) => {
    const key = alias[id] ?? id;
    for (const [navId, a] of links) {
      if (navId === key) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
    },
    // A thin band across the middle of the viewport decides which section is "current".
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}
