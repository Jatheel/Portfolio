// @ts-check
import { prefersReducedMotion } from './device.js';

/** Count hero stats up once when they come into view. The final number is already in the HTML. */
export function initCounters() {
  const els = /** @type {HTMLElement[]} */ ([...document.querySelectorAll('[data-count]')]);
  if (!els.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;

  /** @param {HTMLElement} el */
  const run = (el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || target <= 0) return;
    const start = performance.now();
    const duration = 900;
    /** @param {number} now */
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      run(/** @type {HTMLElement} */ (e.target));
    }
  });
  els.forEach((el) => io.observe(el));
}
