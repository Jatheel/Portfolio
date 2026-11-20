// @ts-check
/**
 * Enforces the JS budgets from CLAUDE.md §8 on dist/: the lazily loaded scene
 * (three + scene code) ≤ 190 KB gzip, all JavaScript ≤ 260 KB gzip.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const DIR = path.resolve('dist/assets');
const SCENE_BUDGET = 190 * 1024;
const TOTAL_BUDGET = 260 * 1024;

const files = readdirSync(DIR).filter((f) => f.endsWith('.js'));
const sizes = files.map((f) => ({
  file: f,
  gz: gzipSync(readFileSync(path.join(DIR, f)), { level: 9 }).length,
}));
const kb = (/** @type {number} */ n) => `${(n / 1024).toFixed(1)} KB`;

const scene = sizes.filter(
  (s) => /^(three|index-scene|scene)/.test(s.file) || s.file.startsWith('index.scene'),
);
const sceneGz = sizes
  .filter((s) => /^(three|scene)[-.]/.test(s.file))
  .reduce((a, s) => a + s.gz, 0);
const total = sizes.reduce((a, s) => a + s.gz, 0);

for (const s of sizes.sort((a, b) => b.gz - a.gz))
  console.log(`${kb(s.gz).padStart(10)}  ${s.file}`);
console.log(`\nscene (three + scene): ${kb(sceneGz)} / ${kb(SCENE_BUDGET)}`);
console.log(`total JS:              ${kb(total)} / ${kb(TOTAL_BUDGET)}`);

const failures = [];
if (sceneGz > SCENE_BUDGET) failures.push('scene chunk over budget');
if (total > TOTAL_BUDGET) failures.push('total JS over budget');
if (failures.length) {
  console.error(`\nBudget FAIL: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`\nBudget OK${scene.length ? '' : ''}`);
