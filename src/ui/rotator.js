// @ts-check
import { prefersReducedMotion } from './device.js';

/** Rotates the hero's "I build …" word. Screen readers get the full list instead (aria-hidden here). */
export function initRotator() {
  const el = document.querySelector('[data-rotator]');
  if (!(el instanceof HTMLElement) || prefersReducedMotion()) return;
  /** @type {string[]} */
  let words = [];
  try {
    words = JSON.parse(el.dataset.words ?? '[]');
  } catch {
    return;
  }
  if (words.length < 2) return;
  let i = 0;

  setInterval(() => {
    if (document.hidden) return;
    el.classList.add('is-swapping');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('is-swapping');
    }, 220);
  }, 2800);
}
