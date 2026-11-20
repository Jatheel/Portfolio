// @ts-check
/**
 * Lazy entry for the 3D background: a circuit board that rewires into a neural network as
 * the page scrolls. Loaded only after first paint, only when WebGL2 exists.
 */
import { WebGLRenderer, Scene, PerspectiveCamera, Group } from 'three';
import { layoutBuilders } from './layouts.js';
import { createNodes } from './nodes.js';
import { createPulses } from './pulses.js';
import { poseBetween } from './camera.js';
import { bindScroll, easeMorph } from './scroll.js';
import { prng } from './traces.js';

const MAX_TILT = (3 * Math.PI) / 180;

/** Give the main thread back between set-up steps so start-up never forms one long task. */
const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));
const EDGE_OPACITY = { light: 0.38, dark: 0.45 };

/**
 * @param {{
 *   canvas: HTMLCanvasElement,
 *   palette: ReturnType<typeof import('../ui/theme.js').readPalette>,
 *   quality: ReturnType<typeof import('../ui/device.js').sceneQuality>,
 *   reducedMotion: boolean,
 *   sections: HTMLElement[],
 *   projectIds: string[],
 *   counts: { projects: number, pads: number, rings: number },
 *   onFail: () => void,
 * }} o
 */
export async function createScene(o) {
  const { canvas, quality, reducedMotion } = o;
  const n = quality.nodes;
  /** @type {Record<string, import('./traces.js').Layout>} */
  const layouts = {};
  for (const [key, build] of layoutBuilders(n, o.counts)) {
    layouts[key] = build();
    await yieldToMain();
  }

  const renderer = new WebGLRenderer({
    canvas,
    antialias: !quality.mobile,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.maxDpr));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const group = new Group();
  scene.add(group);
  const camera = new PerspectiveCamera(45, 1, 0.1, 200);

  const nodes = createNodes(n, layouts, renderer.getPixelRatio());
  const pulses = createPulses(quality.mobile ? 10 : 22, prng(5));
  group.add(...Object.values(nodes.edges), nodes.hiEdges, nodes.points, pulses.points);

  let palette = o.palette;
  let dirty = true;
  const requestRender = () => {
    dirty = true;
  };
  const applyPalette = () => {
    nodes.setPalette(palette, !quality.lowPower && !quality.mobile);
    pulses.setPalette(palette.signal, palette.theme === 'dark');
    requestRender();
  };
  applyPalette();

  const scroll = bindScroll(o.sections, { reducedMotion, onChange: requestRender });
  const traceFirst = scroll.keys.indexOf('trace');
  const traceLast = scroll.keys.lastIndexOf('trace');

  /** @type {{ kind: 'project'|'skills', key: string } | null} */
  let wanted = null;
  let hiOpacity = 0;
  /** @type {number[] | null} */
  let shownEdges = null;
  const hiTarget = new Float32Array(n);
  const pointer = { x: 0, y: 0, rx: 0, ry: 0 };

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
  }
  resize();
  window.addEventListener('resize', resize);

  if (!quality.mobile) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /** Which highlight group applies on the dominant layout, if any. */
  function activeGroup(/** @type {string} */ dom) {
    if (!wanted) return null;
    if (wanted.kind === 'project' && dom === 'neural') {
      const i = o.projectIds.indexOf(wanted.key);
      return i >= 0 ? i : null;
    }
    if (wanted.kind === 'skills' && dom === 'rings') return Number(wanted.key);
    return null;
  }

  function frame(/** @type {number} */ dt, /** @type {number} */ time) {
    if (!reducedMotion) {
      // Frame-rate independent easing toward the scroll position (no scroll-jacking).
      const st = scroll.state;
      st.s += (st.target - st.s) * (1 - Math.exp(-dt * 5));
      if (Math.abs(st.target - st.s) < 0.001) st.s = st.target;
    }
    const s = scroll.state.s;
    const i = Math.max(0, Math.min(scroll.keys.length - 1, Math.floor(s)));
    const a = scroll.keys[i];
    const b = scroll.keys[Math.min(i + 1, scroll.keys.length - 1)];
    const t = a === b ? 0 : easeMorph(Math.min(1, Math.max(0, s - i)));
    const la = layouts[a];
    const lb = layouts[b];
    if (!reducedMotion) {
      la.animate?.(time, la.positions, la.sizes);
      if (lb !== la) lb.animate?.(time, lb.positions, lb.sizes);
    }

    const { position, size, tint, hi } = nodes.attrs;
    const P = /** @type {Float32Array} */ (position.array);
    const S = /** @type {Float32Array} */ (size.array);
    const T = /** @type {Float32Array} */ (tint.array);
    for (let k = 0; k < n * 3; k++)
      P[k] = la.positions[k] + (lb.positions[k] - la.positions[k]) * t;
    for (let k = 0; k < n; k++) {
      S[k] = la.sizes[k] + (lb.sizes[k] - la.sizes[k]) * t;
      T[k] = la.tints[k] + (lb.tints[k] - la.tints[k]) * t;
    }
    position.needsUpdate = size.needsUpdate = tint.needsUpdate = true;

    const base = EDGE_OPACITY[palette.theme === 'dark' ? 'dark' : 'light'];
    for (const [key, line] of Object.entries(nodes.edges)) {
      const w = key === a ? 1 - t : key === b ? t : 0;
      line.visible = w > 0.01;
      /** @type {import('three').LineBasicMaterial} */ (line.material).opacity = base * w;
    }

    // Pulses belong to whichever layout dominates; they fade out mid-morph.
    const dom = t < 0.5 ? a : b;
    pulses.bind(layouts[dom].paths, dom);
    const scrub =
      dom === 'trace' && traceFirst >= 0
        ? Math.min(1, Math.max(0, (s - traceFirst) / (traceLast - traceFirst + 1)))
        : null;
    pulses.update(P, reducedMotion ? 0 : dt, reducedMotion ? 0 : Math.abs(1 - 2 * t), scrub);

    // Highlights ease in and out (instant with reduced motion).
    const g = activeGroup(dom);
    const groupNodes = g !== null ? layouts[dom].groups[g] : null;
    const groupEdges = g !== null ? layouts[dom].groupEdges[g] : null;
    hiTarget.fill(0);
    if (groupNodes) for (const id of groupNodes) if (id >= 0) hiTarget[id] = 1;
    const H = /** @type {Float32Array} */ (hi.array);
    const k = reducedMotion ? 1 : Math.min(1, dt * 8);
    for (let j = 0; j < n; j++) H[j] += (hiTarget[j] - H[j]) * k;
    hi.needsUpdate = true;
    if (groupEdges && groupEdges !== shownEdges) {
      nodes.setHighlightEdges(groupEdges);
      shownEdges = groupEdges;
    }
    hiOpacity += ((groupEdges ? 0.9 : 0) - hiOpacity) * k;
    /** @type {import('three').LineBasicMaterial} */ (nodes.hiEdges.material).opacity = hiOpacity;
    nodes.hiEdges.visible = hiOpacity > 0.01;

    const narrow = window.innerWidth < 768 || camera.aspect < 0.9;
    const pose = poseBetween(a, b, t, narrow);
    camera.position.set(pose.pos[0], pose.pos[1], pose.pos[2]);
    camera.lookAt(pose.look[0], pose.look[1], pose.look[2]);
    pointer.rx += (pointer.y * MAX_TILT - pointer.rx) * Math.min(1, dt * 3);
    pointer.ry += (pointer.x * MAX_TILT - pointer.ry) * Math.min(1, dt * 3);
    group.rotation.set(pointer.rx, pointer.ry, 0);

    renderer.render(scene, camera);
  }

  const frameBudget = quality.mobile || quality.lowPower ? 1000 / 31 : 1000 / 61;
  let raf = 0;
  let last = performance.now();
  let running = true;
  const loop = (/** @type {number} */ now) => {
    raf = requestAnimationFrame(loop);
    // Cap at ~60 fps on high-refresh screens, ~30 fps on phones and low-power devices.
    if (now - last < frameBudget) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (reducedMotion && !dirty) return;
    dirty = false;
    frame(dt, now / 1000);
  };
  const start = () => {
    if (running && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    running = false;
    stop();
    o.onFail();
  });

  // Compile shaders off the main thread where KHR_parallel_shader_compile is available.
  await yieldToMain();
  await renderer.compileAsync(scene, camera);
  await yieldToMain();
  frame(0, 0);
  canvas.classList.add('is-ready');
  start();

  return {
    /** @param {typeof palette} p */
    setPalette(p) {
      palette = p;
      applyPalette();
    },
    /** @param {'project'|'skills'|null} kind @param {string} [key] */
    highlight(kind, key = '') {
      wanted = kind ? { kind, key } : null;
      requestRender();
    },
  };
}
