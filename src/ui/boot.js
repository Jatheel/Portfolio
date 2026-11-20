// @ts-check
/** Ends the first-visit boot animation (started by the inline script) and remembers the visit. */
export function initBoot() {
  const root = document.documentElement;
  try {
    localStorage.setItem('booted', '1');
  } catch {
    /* storage blocked: the animation may replay next visit */
  }
  if (!root.classList.contains('is-booting')) return;
  setTimeout(() => root.classList.remove('is-booting'), 1200);
}
