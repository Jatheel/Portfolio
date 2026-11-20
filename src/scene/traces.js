// @ts-check
/**
 * Helpers for building layouts: a seeded PRNG, a node builder that never exceeds N,
 * and Manhattan (right-angle) trace routing on a grid.
 */

/**
 * Small deterministic PRNG (mulberry32) so every visit shows the same layouts.
 * @param {number} seed
 */
export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @typedef {Object} Layout
 * @property {Float32Array} positions  xyz per node
 * @property {Float32Array} sizes      point size per node
 * @property {Float32Array} tints      0 = accent, 1 = copper
 * @property {Uint32Array} edges       index pairs
 * @property {number[][]} paths        node sequences that pulses can travel
 * @property {number[][]} groups       node subsets for hover highlights
 * @property {number[][]} groupEdges   edge index pairs (flattened) per group
 * @property {((time: number, pos: Float32Array, size: Float32Array) => void)} [animate]
 */

/** Collects nodes and edges for one layout, capped at `n` nodes. */
export class Builder {
  /** @param {number} n @param {() => number} rand */
  constructor(n, rand) {
    this.n = n;
    this.rand = rand;
    this.count = 0;
    this.positions = new Float32Array(n * 3);
    this.sizes = new Float32Array(n);
    this.tints = new Float32Array(n);
    /** @type {number[]} */ this.edges = [];
    /** @type {number[][]} */ this.paths = [];
    /** @type {number[][]} */ this.groups = [];
    /** @type {number[][]} */ this.groupEdges = [];
  }

  get full() {
    return this.count >= this.n;
  }

  /** @returns {number} node index, or -1 when the layout is full */
  add(x = 0, y = 0, z = 0, size = 1, tint = 0) {
    if (this.full) return -1;
    const i = this.count++;
    this.positions.set([x, y, z], i * 3);
    this.sizes[i] = size;
    this.tints[i] = tint;
    return i;
  }

  /** @param {number} a @param {number} b */
  edge(a, b) {
    if (a >= 0 && b >= 0 && a !== b) this.edges.push(a, b);
  }

  /** Link a list of nodes in order (optionally closing the loop). */
  chain(/** @type {number[]} */ ids, closed = false) {
    for (let k = 1; k < ids.length; k++) this.edge(ids[k - 1], ids[k]);
    if (closed && ids.length > 2) this.edge(ids[ids.length - 1], ids[0]);
  }

  /** Remaining nodes become faint background dust spread in depth. */
  dust(spread = 18) {
    while (!this.full) {
      const r = this.rand;
      this.add(
        (r() - 0.5) * 2 * spread,
        (r() - 0.5) * spread * 1.1,
        -2 - r() * 10,
        0.35,
        r() * 0.4,
      );
    }
  }

  /** @returns {Layout} */
  done() {
    this.dust();
    return {
      positions: this.positions,
      sizes: this.sizes,
      tints: this.tints,
      edges: new Uint32Array(this.edges),
      paths: this.paths,
      groups: this.groups,
      groupEdges: this.groupEdges,
    };
  }
}

/**
 * Route a right-angle trace between two grid points, adding a node at every grid step.
 * Returns the node indices along the trace (shared start node first).
 * @param {Builder} b @param {number} startId
 * @param {[number, number]} from @param {[number, number]} to
 * @param {{ step?: number, horizontalFirst?: boolean, size?: number, tint?: number }} [o]
 */
export function routeTrace(b, startId, from, to, o = {}) {
  const step = o.step ?? 1;
  const size = o.size ?? 0.8;
  const tint = o.tint ?? 0.7;
  const ids = [startId];
  let [x, y] = from;
  const [tx, ty] = to;
  const legs = o.horizontalFirst === false ? ['y', 'x'] : ['x', 'y'];
  for (const axis of legs) {
    const target = axis === 'x' ? tx : ty;
    let cur = axis === 'x' ? x : y;
    const dir = Math.sign(target - cur);
    while (dir !== 0 && Math.abs(target - cur) >= step * 0.5 && !b.full) {
      cur += dir * step;
      if (axis === 'x') x = cur;
      else y = cur;
      ids.push(b.add(x, y, 0, size, tint));
    }
  }
  const clean = ids.filter((i) => i >= 0);
  b.chain(clean);
  return clean;
}
