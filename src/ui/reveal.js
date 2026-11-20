// @ts-check
import { prefersReducedMotion } from './device.js';

/**
 * Fade-and-rise for blocks as they enter the viewport, once. Off for reduced motion.
 * The hiding styles are armed only after the observer's first report, so content already on
 * screen is never hidden, and no synchronous layout read is needed at start-up.
 */
export function initReveal() {
  const items = [...document.querySelectorAll('.reveal')];
  if (!items.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  let armed = false;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
      if (!armed) {
        armed = true;
        document.documentElement.classList.add('reveal-ready');
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => io.observe(el));
}
