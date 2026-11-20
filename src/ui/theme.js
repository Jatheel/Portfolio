// @ts-check
/**
 * Theme toggle. The inline script in index.html applies the theme before first paint;
 * this module wires the button, remembers the choice and follows the system when unset.
 */
const KEY = 'theme';

/** @returns {'light'|'dark'|null} */
function stored() {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

/** @returns {'light'|'dark'} */
export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

/** Read colour tokens so the scene always matches the CSS. */
export function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  /** @param {string} name */
  const v = (name) => cs.getPropertyValue(name).trim();
  return {
    theme: currentTheme(),
    bg: v('--bg'),
    ink: v('--ink'),
    muted: v('--muted'),
    line: v('--line'),
    accent: v('--accent'),
    copper: v('--copper'),
    signal: v('--signal'),
  };
}

/** @param {'light'|'dark'} theme */
function apply(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  const btn = document.querySelector('[data-theme-toggle]');
  btn?.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function initTheme() {
  const btn = document.querySelector('[data-theme-toggle]');
  if (btn instanceof HTMLButtonElement) {
    btn.hidden = false;
    apply(currentTheme());
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* storage blocked: the choice lasts for this page only */
      }
      apply(next);
    });
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!stored()) apply(e.matches ? 'dark' : 'light');
  });
}
