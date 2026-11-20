// @ts-check
/**
 * Camera pose per layout. On wide screens most layouts sit right of the text column;
 * on narrow screens the camera pulls back and centres so the scene stays a backdrop.
 * @typedef {{ pos: [number, number, number], look: [number, number, number] }} Pose
 */

/** @type {Record<string, Pose>} */
const DESKTOP = {
  board: { pos: [-6, -1, 24], look: [-6, 0, 0] },
  chip: { pos: [-10, 2, 22], look: [-9, 0, 0] },
  detect: { pos: [-3, 0, 25], look: [-2, 0, 0] },
  neural: { pos: [0, 0, 27], look: [0, 0, 0] },
  trace: { pos: [-4, 0, 25], look: [-2, 0, 0] },
  rings: { pos: [-8, 6, 24], look: [-6, 0, 0] },
  antenna: { pos: [-9, 3, 26], look: [-7, 0, 0] },
};

/** @type {Record<string, Pose>} */
const MOBILE = {
  board: { pos: [0, 0, 44], look: [0, 0, 0] },
  chip: { pos: [0, 0, 34], look: [0, 0, 0] },
  detect: { pos: [0, 0, 44], look: [0, 0, 0] },
  neural: { pos: [0, 0, 46], look: [0, 0, 0] },
  trace: { pos: [0, 0, 44], look: [0, 0, 0] },
  rings: { pos: [0, 4, 36], look: [0, 0, 0] },
  antenna: { pos: [0, 2, 38], look: [0, 0, 0] },
};

/**
 * Interpolated pose between two layouts.
 * @param {string} a @param {string} b @param {number} t @param {boolean} narrow
 */
export function poseBetween(a, b, t, narrow) {
  const table = narrow ? MOBILE : DESKTOP;
  const pa = table[a] ?? table.board;
  const pb = table[b] ?? table.board;
  /** @param {number[]} u @param {number[]} v */
  const mix = (u, v) => u.map((x, i) => x + (v[i] - x) * t);
  return { pos: mix(pa.pos, pb.pos), look: mix(pa.look, pb.look) };
}
