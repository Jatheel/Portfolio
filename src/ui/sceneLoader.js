// @ts-check
/**
 * Loads the 3D scene last: after `load`, when the browser is idle, and only with WebGL2.
 * Any failure leaves the static board background (html.no-webgl).
 */
import { hasWebGL2, prefersReducedMotion, sceneQuality } from './device.js';
import { readPalette } from './theme.js';

const root = document.documentElement;
const fail = () => root.classList.add('no-webgl');

const START_DELAY_MS = 3500;
const ENGAGE = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];

/**
 * Run `cb` in an idle period after `load`, once the visitor engages or START_DELAY_MS passes.
 * Creating a WebGL context is a ~100 ms main-thread task; keeping it out of the first seconds
 * keeps the page responsive while it is first being read.
 * @param {() => void} cb
 */
function whenIdle(cb) {
  let started = false;
  const go = () => {
    if (started) return;
    started = true;
    ENGAGE.forEach((e) => window.removeEventListener(e, go));
    if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 2000 });
    else setTimeout(cb, 300);
  };
  const armed = () => {
    ENGAGE.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
    setTimeout(go, START_DELAY_MS);
  };
  if (document.readyState === 'complete') armed();
  else window.addEventListener('load', armed, { once: true });
}

async function load() {
  const canvas = document.querySelector('[data-scene]');
  if (!(canvas instanceof HTMLCanvasElement) || !hasWebGL2()) return fail();
  try {
    const { createScene } = await import('../scene/index.js');
    const sections = /** @type {HTMLElement[]} */ ([...document.querySelectorAll('[data-layout]')]);
    const projectIds = [...document.querySelectorAll('[data-project-list] > [data-project]')].map(
      (el) => /** @type {HTMLElement} */ (el).dataset.project ?? '',
    );
    const scene = await createScene({
      canvas,
      palette: readPalette(),
      quality: sceneQuality(),
      reducedMotion: prefersReducedMotion(),
      sections,
      projectIds,
      counts: {
        projects: projectIds.length,
        pads: document.querySelectorAll('.timeline__item').length,
        rings: document.querySelectorAll('[data-skill-group]').length,
      },
      onFail: fail,
    });
    window.addEventListener('themechange', () => scene.setPalette(readPalette()));
    wireHighlights(scene);
  } catch {
    fail();
  }
}

/**
 * Hovering or focusing a project card or skill group lights up its part of the scene.
 * @param {{ highlight: (kind: 'project'|'skills'|null, key?: string) => void }} scene
 */
function wireHighlights(scene) {
  /** @param {Event} e */
  const enter = (e) => {
    const el = /** @type {HTMLElement} */ (e.target).closest('[data-project], [data-skill-group]');
    if (!(el instanceof HTMLElement)) return;
    if (el.dataset.project) scene.highlight('project', el.dataset.project);
    else scene.highlight('skills', el.dataset.skillGroup);
  };
  /** @param {Event} e */
  const leave = (e) => {
    const to = /** @type {FocusEvent | PointerEvent} */ (e).relatedTarget;
    const from = /** @type {HTMLElement} */ (e.target).closest(
      '[data-project], [data-skill-group]',
    );
    if (from && to instanceof Element && from.contains(to)) return;
    scene.highlight(null);
  };
  for (const sel of ['[data-project-list]', '.skill-groups']) {
    const host = document.querySelector(sel);
    if (!host) continue;
    host.addEventListener('pointerover', enter);
    host.addEventListener('pointerout', leave);
    host.addEventListener('focusin', enter);
    host.addEventListener('focusout', leave);
  }
}

export function initScene() {
  whenIdle(load);
}
