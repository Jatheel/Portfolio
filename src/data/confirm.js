// @ts-check
/**
 * Sentinel for facts the owner has not confirmed yet.
 * It is a Symbol on purpose: interpolating it into a string throws, so an unconfirmed
 * value can never leak into rendered HTML by accident. Renderers hide these fields.
 */
export const TO_CONFIRM = Symbol.for('TO_CONFIRM');

/**
 * True when a value is present and confirmed (not TO_CONFIRM, null, undefined or '').
 * @param {unknown} value
 * @returns {boolean}
 */
export function isSet(value) {
  return value !== TO_CONFIRM && value != null && value !== '';
}
