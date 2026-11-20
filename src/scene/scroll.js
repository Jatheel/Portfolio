// @ts-check
/**
 * Binds page scroll to a continuous "section position" s (0 = hero, 1 = about, …).
 * Each boundary contributes 0→1 while the next section's top travels from the bottom of the
 * viewport to 30% from the top. Offsets are measured only on resize/content changes, and the
 * scroll listener is passive. No scroll-jacking: scroll is read, never set.
 *
 * This replaces GSAP ScrollTrigger (CLAUDE.md §3): ScrollTrigger's refresh caused a 0.5 s long
 * task on throttled mobile, and dropping it saves 44 KB gzip of JavaScript.
 */

/** power2.inOut */
export const easeMorph = (/** @type {number} */ t) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/** @param {number} v */
const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * @param {HTMLElement[]} sections in page order, each with data-layout
 * @param {{ reducedMotion: boolean, onChange: () => void }} opts
 */
export function bindScroll(sections, opts) {
  const state = { s: 0, target: 0 };
  /** @type {number[]} */
  let tops = [];
  let vh = window.innerHeight;

  function update() {
    const y = window.scrollY;
    let target = 0;
    for (let i = 1; i < tops.length; i++) {
      const start = tops[i] - vh;
      const end = tops[i] - vh * 0.3;
      target += clamp01((y - start) / (end - start));
    }
    state.target = target;
    // Reduced motion: still frames only, jump to the layout of the section in view.
    if (opts.reducedMotion) state.s = Math.round(target);
    opts.onChange();
  }

  function measure() {
    vh = window.innerHeight;
    const y = window.scrollY;
    tops = sections.map((s) => s.getBoundingClientRect().top + y);
    update();
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  // Fonts, images and the case-study drawer change the page height; re-measure after layout.
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  measure();
  // Start at the current position instead of morphing in from the hero on reload.
  state.s = state.target;

  return {
    state,
    keys: sections.map((s) => s.dataset.layout ?? 'board'),
  };
}
