// @ts-check
/**
 * One layout per section (CLAUDE.md §8). Every layout has exactly N nodes so positions
 * can be interpolated; spare nodes become background dust. All randomness is seeded.
 */
import { Builder, prng, routeTrace } from './traces.js';
import { neural, trace, rings, antenna } from './layouts-net.js';

/** @typedef {import('./traces.js').Layout} Layout */

/** Circuit board: IC packages with pins, joined by right-angle copper traces. */
function board(/** @type {number} */ n) {
  const b = new Builder(n, prng(11));
  const r = b.rand;
  const ics = [
    [-10, 4, 3, 2],
    [9, 5, 2, 2],
    [-5, -4, 3, 2],
    [7, -4, 3, 2],
    [0, 2, 2, 2],
    [-14, -6, 1, 1],
  ];
  /** @type {{ id: number, x: number, y: number }[][]} */
  const pins = [];
  for (const [cx, cy, hw, hh] of ics) {
    const ring = [];
    for (let x = -hw; x <= hw; x++) ring.push([cx + x, cy + hh]);
    for (let y = hh - 1; y >= -hh; y--) ring.push([cx + hw, cy + y]);
    for (let x = hw - 1; x >= -hw; x--) ring.push([cx + x, cy - hh]);
    for (let y = -hh + 1; y < hh; y++) ring.push([cx - hw, cy + y]);
    const ids = ring.map(([x, y]) => ({ id: b.add(x, y, 0, 1.7, 1), x, y }));
    b.chain(
      ids.map((p) => p.id).filter((i) => i >= 0),
      true,
    );
    pins.push(ids.filter((p) => p.id >= 0));
  }
  // Traces between pins of different ICs, or out to the board edge.
  const budget = Math.floor(n * 0.72);
  for (let k = 0; b.count < budget && k < 400; k++) {
    const a = pins[k % pins.length];
    const start = a[Math.floor(r() * a.length)];
    if (!start) continue;
    let to;
    if (r() < 0.65) {
      const other = pins[(k + 1 + Math.floor(r() * (pins.length - 1))) % pins.length];
      const end = other[Math.floor(r() * other.length)];
      to = [end.x, end.y];
    } else {
      to = [Math.round((r() - 0.5) * 34), Math.round((r() - 0.5) * 20)];
    }
    const path = routeTrace(b, start.id, [start.x, start.y], /** @type {[number, number]} */ (to), {
      horizontalFirst: r() < 0.5,
      tint: 0.75,
    });
    const via = path[path.length - 1];
    if (via >= 0) b.sizes[via] = 1.3;
    if (path.length > 3) b.paths.push(path);
  }
  return b.done();
}

/** IC package seen from above: outline, die grid, and pins radiating on four sides. */
function chip(/** @type {number} */ n) {
  const b = new Builder(n, prng(23));
  const s = 4;
  const step = 0.5;
  const outline = [];
  for (let t = -s; t < s; t += step) outline.push([t, s]);
  for (let t = s; t > -s; t -= step) outline.push([s, t]);
  for (let t = s; t > -s; t -= step) outline.push([t, -s]);
  for (let t = -s; t < s; t += step) outline.push([-s, t]);
  b.chain(
    outline.map(([x, y]) => b.add(x, y, 0, 1.1, 0)),
    true,
  );
  for (let x = -2; x <= 2; x++) for (let y = -2; y <= 2; y++) b.add(x * 0.8, y * 0.8, 0.3, 0.9, 1);
  const pinCount = 7;
  for (let side = 0; side < 4; side++) {
    for (let p = 0; p < pinCount; p++) {
      const along = -s + ((p + 1) * (2 * s)) / (pinCount + 1);
      const len = 3 + ((p * 7 + side * 3) % 4);
      const ids = [];
      for (let d = 0; d <= len; d += step) {
        const out = s + 0.2 + d;
        const [x, y] = [
          [along, out],
          [out, -along],
          [-along, -out],
          [-out, along],
        ][side];
        ids.push(b.add(x, y, 0, d >= len - step ? 1.8 : 0.7, 1));
      }
      b.chain(ids.filter((i) => i >= 0));
      if (ids.length > 3) b.paths.push(ids.filter((i) => i >= 0));
    }
  }
  return b.done();
}

/** Clusters wrapped by bounding boxes — a nod to object detection. */
function detect(/** @type {number} */ n) {
  const b = new Builder(n, prng(37));
  const r = b.rand;
  const boxes = [
    [-11, 4, 3.2, 2.4],
    [-2, 5, 2.6, 2],
    [8, 3.5, 3.6, 2.8],
    [-8, -4, 2.8, 2.6],
    [2, -3.5, 3.4, 2.2],
    [11, -5, 2.4, 2],
  ];
  const perBlob = Math.floor((n * 0.55) / boxes.length);
  for (const [cx, cy, hw, hh] of boxes) {
    const ring = [];
    const step = 0.45;
    for (let x = -hw; x < hw; x += step) ring.push([cx + x, cy + hh]);
    for (let y = hh; y > -hh; y -= step) ring.push([cx + hw, cy + y]);
    for (let x = hw; x > -hw; x -= step) ring.push([cx + x, cy - hh]);
    for (let y = -hh; y < hh; y += step) ring.push([cx - hw, cy + y]);
    b.chain(
      ring.map(([x, y], k) => b.add(x, y, 0, k === 0 ? 1.8 : 0.8, 1)),
      true,
    );
    // Label tab on the top-left corner.
    b.chain([0, 1, 2, 3].map((k) => b.add(cx - hw + k * 0.45, cy + hh + 0.5, 0, 0.9, 1)));
    for (let k = 0; k < perBlob; k++) {
      const gx = (r() + r() + r() - 1.5) / 1.5;
      const gy = (r() + r() + r() - 1.5) / 1.5;
      b.add(cx + gx * hw * 0.85, cy + gy * hh * 0.85, (r() - 0.5) * 1.5, 0.6 + r() * 1.2, 0);
    }
  }
  return b.done();
}

/**
 * One builder per layout, so the caller can yield to the main thread between them.
 * @param {number} n  node count for this device
 * @param {{ projects: number, pads: number, rings: number }} counts
 * @returns {Array<[string, () => Layout]>}
 */
export function layoutBuilders(n, counts) {
  return [
    ['board', () => board(n)],
    ['chip', () => chip(n)],
    ['detect', () => detect(n)],
    ['neural', () => neural(n, counts.projects)],
    ['trace', () => trace(n, counts.pads)],
    ['rings', () => rings(n, counts.rings)],
    ['antenna', () => antenna(n)],
  ];
}
