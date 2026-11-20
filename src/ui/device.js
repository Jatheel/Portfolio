// @ts-check
/** Capability and preference checks shared by the UI and the scene loader. */

export function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isMobile() {
  return matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
}

/** True when WebGL2 is available; the probe context is released straight away. */
export function hasWebGL2() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Rendering budget for this device (CLAUDE.md §8).
 * @returns {{ nodes: number, mobile: boolean, lowPower: boolean, maxDpr: number }}
 */
export function sceneQuality() {
  const nav =
    /** @type {Navigator & { deviceMemory?: number, connection?: { saveData?: boolean } }} */ (
      navigator
    );
  const cores = nav.hardwareConcurrency || 4;
  const lowPower =
    cores < 4 ||
    (nav.deviceMemory !== undefined && nav.deviceMemory < 4) ||
    !!nav.connection?.saveData;
  const mobile = isMobile();
  return {
    nodes: lowPower ? 260 : mobile ? 420 : 900,
    mobile,
    lowPower,
    maxDpr: mobile ? 1.5 : 2,
  };
}
