// @ts-check
/** Signal pulses travelling along a layout's paths, following nodes as they morph. */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
  AdditiveBlending,
  NormalBlending,
} from 'three';

/**
 * @param {number} count
 * @param {() => number} rand
 */
export function createPulses(count, rand) {
  const geometry = new BufferGeometry();
  const pos = new Float32Array(count * 3);
  const attr = new BufferAttribute(pos, 3);
  geometry.setAttribute('position', attr);
  const material = new PointsMaterial({
    size: 0.32,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    color: new Color('#5cc8f2'),
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;

  /** @type {{ path: number[], u: number, speed: number }[]} */
  let pulses = [];
  /** @type {string | null} */
  let boundTo = null;

  /** @param {number[][]} paths @param {string} key */
  function bind(paths, key) {
    if (boundTo === key) return;
    boundTo = key;
    pulses = paths.length
      ? Array.from({ length: count }, (_, i) => {
          const path = paths[Math.floor(rand() * paths.length)];
          return { path, u: (i / count) * (path.length - 1), speed: 4 + rand() * 6 };
        })
      : [];
  }

  return {
    points,
    bind,
    /**
     * @param {Float32Array} nodes current node positions
     * @param {number} dt seconds
     * @param {number} opacity
     * @param {number | null} scrubbed when set, pulse 0 sits at this 0–1 fraction of its path
     */
    update(nodes, dt, opacity, scrubbed = null) {
      material.opacity = pulses.length ? opacity : 0;
      pulses.forEach((p, i) => {
        const last = p.path.length - 1;
        if (i === 0 && scrubbed !== null) p.u = scrubbed * last;
        else p.u = (p.u + p.speed * dt) % last;
        const k = Math.floor(p.u);
        const f = p.u - k;
        const a = p.path[k] * 3;
        const b = p.path[Math.min(k + 1, last)] * 3;
        for (let c = 0; c < 3; c++)
          pos[i * 3 + c] = nodes[a + c] + (nodes[b + c] - nodes[a + c]) * f;
      });
      for (let i = pulses.length; i < count; i++) pos.fill(0, i * 3, i * 3 + 3);
      attr.needsUpdate = true;
    },
    /** @param {string} signal @param {boolean} dark */
    setPalette(signal, dark) {
      material.color.set(signal);
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
    },
  };
}
