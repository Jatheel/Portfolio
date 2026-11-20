// @ts-check
/**
 * Node points (one draw call, soft round sprites) and one LineSegments per layout.
 * All edge sets share the node position buffer, so edges follow nodes while they morph.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Points,
  ShaderMaterial,
  AdditiveBlending,
  NormalBlending,
  DynamicDrawUsage,
} from 'three';

const VERT = /* glsl */ `
attribute float aSize;
attribute float aTint;
attribute float aHi;
uniform float uScale;
varying float vTint;
varying float vHi;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (1.0 + aHi * 0.9) * uScale / -mv.z;
  vTint = aTint;
  vHi = aHi;
}`;

const FRAG = /* glsl */ `
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uHi;
uniform float uOpacity;
uniform float uGlow;
varying float vTint;
varying float vHi;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.3, d);
  float halo = uGlow * smoothstep(0.5, 0.0, d) * 0.55;
  float a = max(core, halo);
  if (a < 0.02) discard;
  vec3 c = mix(mix(uA, uB, vTint), uHi, vHi);
  gl_FragColor = vec4(c, a * uOpacity);
}`;

/**
 * @param {number} n
 * @param {Record<string, import('./traces.js').Layout>} layouts
 * @param {number} pixelRatio
 */
export function createNodes(n, layouts, pixelRatio) {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(n * 3), 3).setUsage(DynamicDrawUsage);
  const size = new BufferAttribute(new Float32Array(n), 1).setUsage(DynamicDrawUsage);
  const tint = new BufferAttribute(new Float32Array(n), 1).setUsage(DynamicDrawUsage);
  const hi = new BufferAttribute(new Float32Array(n), 1).setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', position);
  geometry.setAttribute('aSize', size);
  geometry.setAttribute('aTint', tint);
  geometry.setAttribute('aHi', hi);

  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uScale: { value: 110 * pixelRatio },
      uA: { value: new Color() },
      uB: { value: new Color() },
      uHi: { value: new Color() },
      uOpacity: { value: 0.85 },
      uGlow: { value: 0 },
    },
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;

  /** @type {Record<string, LineSegments>} */
  const edges = {};
  for (const [key, layout] of Object.entries(layouts)) {
    const g = new BufferGeometry();
    g.setAttribute('position', position);
    g.setIndex(new BufferAttribute(layout.edges, 1));
    const m = new LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const line = new LineSegments(g, m);
    line.frustumCulled = false;
    line.visible = false;
    edges[key] = line;
  }

  // Highlight edges are rebuilt when the hovered card or skill group changes.
  const hiGeometry = new BufferGeometry();
  hiGeometry.setAttribute('position', position);
  hiGeometry.setIndex(new BufferAttribute(new Uint32Array(0), 1));
  const hiEdges = new LineSegments(
    hiGeometry,
    new LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  hiEdges.frustumCulled = false;

  return {
    points,
    edges,
    hiEdges,
    attrs: { position, size, tint, hi },
    /** @param {number[]} pairs */
    setHighlightEdges(pairs) {
      hiGeometry.setIndex(new BufferAttribute(new Uint32Array(pairs), 1));
    },
    /**
     * @param {{ theme: string, accent: string, copper: string, signal: string, muted: string }} p
     * @param {boolean} glow
     */
    setPalette(p, glow) {
      const dark = p.theme === 'dark';
      material.uniforms.uA.value.set(p.accent);
      material.uniforms.uB.value.set(p.copper);
      material.uniforms.uHi.value.set(p.signal);
      material.uniforms.uOpacity.value = dark ? 0.9 : 0.7;
      material.uniforms.uGlow.value = dark && glow ? 1 : 0;
      material.blending = dark ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
      for (const line of Object.values(edges)) {
        const m = /** @type {LineBasicMaterial} */ (line.material);
        m.color.set(p.copper);
        m.blending = dark ? AdditiveBlending : NormalBlending;
        m.needsUpdate = true;
      }
      const hm = /** @type {LineBasicMaterial} */ (hiEdges.material);
      hm.color.set(p.signal);
      hm.blending = dark ? AdditiveBlending : NormalBlending;
      hm.needsUpdate = true;
    },
  };
}
