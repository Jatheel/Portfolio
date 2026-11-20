// @ts-check
/** Network-like layouts: neural net, experience trace, skill rings, contact antenna. */
import { Builder, prng } from './traces.js';

/**
 * Feed-forward network: 5 layers, sparse edges between neighbours. Each project owns a fixed
 * subset of hidden neurons; its group edges are the paths through them.
 * @param {number} n @param {number} projects
 */
export function neural(n, projects) {
  const b = new Builder(n, prng(53));
  const r = b.rand;
  const counts = n < 400 ? [4, 7, 8, 7, 3] : [6, 10, 12, 10, 4];
  const xs = [-13, -6.5, 0, 6.5, 13];
  /** @type {number[][]} */
  const layers = counts.map((c, l) =>
    Array.from({ length: c }, (_, k) =>
      b.add(
        xs[l],
        (k - (c - 1) / 2) * (16 / Math.max(c, 6)),
        0,
        l === 0 || l === 4 ? 2 : 2.4,
        l === 4 ? 1 : 0,
      ),
    ),
  );
  /** @type {[number, number][]} */
  const links = [];
  for (let l = 0; l < 4; l++) {
    for (const a of layers[l]) {
      const next = layers[l + 1];
      const fan = Math.min(next.length, 3 + Math.floor(r() * 2));
      const picked = new Set();
      while (picked.size < fan) picked.add(next[Math.floor(r() * next.length)]);
      for (const c of picked) {
        b.edge(a, c);
        links.push([a, c]);
      }
    }
  }
  // Signal dots sit along some connections, so the net looks "alive" and uses spare nodes.
  /** @type {Map<string, number[]>} */
  const dotsOn = new Map();
  const dotBudget = Math.floor(n * 0.5);
  for (let k = 0; b.count < dotBudget && k < links.length * 4; k++) {
    const [a, c] = links[k % links.length];
    const t = r();
    const pa = b.positions.subarray(a * 3, a * 3 + 3);
    const pc = b.positions.subarray(c * 3, c * 3 + 3);
    const id = b.add(pa[0] + (pc[0] - pa[0]) * t, pa[1] + (pc[1] - pa[1]) * t, 0, 0.45, 0.5);
    const key = `${a}-${c}`;
    dotsOn.set(key, [...(dotsOn.get(key) ?? []), id]);
  }
  // Project groups: two neurons in each hidden layer, deterministic per project index.
  for (let p = 0; p < projects; p++) {
    const g = new Set();
    for (let l = 1; l <= 3; l++) {
      const layer = layers[l];
      g.add(layer[(p * 2 + l) % layer.length]);
      g.add(layer[(p * 2 + l * 3 + 1) % layer.length]);
    }
    const edges = [];
    for (const [a, c] of links) {
      if (g.has(a) || g.has(c)) {
        edges.push(a, c);
        for (const d of dotsOn.get(`${a}-${c}`) ?? []) g.add(d);
      }
    }
    b.groups.push([...g]);
    b.groupEdges.push(edges);
  }
  // Pulse paths: random walks from input to output along real edges.
  for (let k = 0; k < 24; k++) {
    let node = layers[0][Math.floor(r() * layers[0].length)];
    const path = [node];
    for (let l = 0; l < 4; l++) {
      const outs = links.filter(([a]) => a === node).map(([, c]) => c);
      node = outs[Math.floor(r() * outs.length)];
      path.push(node);
    }
    b.paths.push(path);
  }
  return b.done();
}

/**
 * One long right-angled signal trace with a solder pad per experience/leadership item.
 * @param {number} n @param {number} pads
 */
export function trace(n, pads) {
  const b = new Builder(n, prng(71));
  const pts = [
    [-15, 7],
    [-4, 7],
    [-4, 3],
    [9, 3],
    [9, -1],
    [-9, -1],
    [-9, -5],
    [4, -5],
    [4, -8],
    [15, -8],
  ];
  const lengths = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lengths.reduce((a, c) => a + c, 0);
  const samples = Math.floor(n * 0.5);
  /** @param {number} d */
  const at = (d) => {
    let i = 0;
    while (i < lengths.length - 1 && d > lengths[i]) d -= lengths[i++];
    const t = Math.min(1, d / lengths[i]);
    return [
      pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
      pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
    ];
  };
  const line = [];
  for (let k = 0; k < samples; k++) {
    const [x, y] = at((k / (samples - 1)) * total);
    line.push(b.add(x, y, 0, 0.7, 1));
  }
  b.chain(line);
  b.paths.push(line);
  for (let p = 0; p < pads; p++) {
    const [x, y] = at(((p + 0.5) / pads) * total);
    const center = b.add(x, y, 0.1, 3, 1);
    const ring = Array.from({ length: 14 }, (_, k) => {
      const a = (k / 14) * Math.PI * 2;
      return b.add(x + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, 0, 0.8, 0);
    });
    b.chain(ring, true);
    b.groups.push([center, ...ring]);
    b.groupEdges.push([]);
  }
  return b.done();
}

/**
 * Concentric, slightly tilted rings — one per skill group.
 * @param {number} n @param {number} count
 */
export function rings(n, count) {
  const b = new Builder(n, prng(89));
  const radii = Array.from({ length: count }, (_, i) => 2.2 + i * 1.35);
  const sum = radii.reduce((a, c) => a + c, 0);
  const budget = Math.floor(n * 0.8);
  const tilt = 0.95;
  radii.forEach((rad, i) => {
    const m = Math.max(12, Math.floor((budget * rad) / sum));
    const ids = [];
    const edges = [];
    for (let k = 0; k < m; k++) {
      const a = (k / m) * Math.PI * 2 + i * 0.4;
      const y = Math.sin(a) * rad;
      ids.push(
        b.add(
          Math.cos(a) * rad,
          y * Math.cos(tilt),
          y * Math.sin(tilt),
          k % 6 === 0 ? 1.6 : 0.8,
          i % 2,
        ),
      );
    }
    const clean = ids.filter((id) => id >= 0);
    b.chain(clean, true);
    for (let k = 0; k < clean.length; k++) edges.push(clean[k], clean[(k + 1) % clean.length]);
    b.groups.push(clean);
    b.groupEdges.push(edges);
  });
  return b.done();
}

/** Nodes gather to a point while ripple rings expand outward (animated per frame). */
export function antenna(/** @type {number} */ n) {
  const b = new Builder(n, prng(97));
  const r = b.rand;
  const core = Math.floor(n * 0.22);
  for (let k = 0; k < core; k++) {
    const g = () => (r() + r() + r() - 1.5) * 0.5;
    b.add(g(), 1 + g(), g(), 0.6 + r(), r() < 0.3 ? 1 : 0);
  }
  const mast = [];
  for (let y = 1; y >= -7; y -= 0.4) mast.push(b.add(0, y, 0, 0.8, 1));
  b.chain(mast.filter((i) => i >= 0));
  const ringCount = 4;
  const per = Math.floor((n * 0.6) / ringCount);
  /** @type {{ id: number, a: number, ring: number }[]} */
  const wave = [];
  for (let ring = 0; ring < ringCount; ring++) {
    const ids = [];
    for (let k = 0; k < per; k++) {
      const a = (k / per) * Math.PI * 2;
      const id = b.add(0, 1, 0, 0.9, ring % 2);
      ids.push(id);
      wave.push({ id, a, ring });
    }
    b.chain(
      ids.filter((i) => i >= 0),
      true,
    );
  }
  const layout = b.done();
  const maxR = 13;
  // Ring radius grows with time and wraps, so ripples keep expanding from the antenna.
  layout.animate = (time, pos, size) => {
    for (const w of wave) {
      if (w.id < 0) continue;
      const rad = ((time * 1.6 + (w.ring * maxR) / ringCount) % maxR) + 0.5;
      pos[w.id * 3] = Math.cos(w.a) * rad;
      pos[w.id * 3 + 1] = 1 + Math.sin(w.a) * rad * 0.42;
      pos[w.id * 3 + 2] = Math.sin(w.a) * rad * 0.3;
      size[w.id] = 1.4 * (1 - rad / (maxR + 1));
    }
  };
  layout.animate(2, layout.positions, layout.sizes);
  return layout;
}
