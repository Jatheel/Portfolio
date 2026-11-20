// @ts-check
/**
 * Validates src/data/profile.js against the truthfulness rules in CLAUDE.md §2.2 and §5.3.
 *   npm run check:data              errors fail; TO_CONFIRM items are listed as warnings
 *   npm run check:data -- --strict  any remaining TO_CONFIRM also fails (CI on main)
 */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { TO_CONFIRM } from '../src/data/confirm.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STATUSES = ['completed', 'ongoing', 'planned'];
const CATEGORIES = ['cv', 'genai', 'fullstack', 'automation', 'hardware'];
const STEP_STATES = ['done', 'active', 'todo'];
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BANNED = [
  'expert',
  'production-ready',
  'highly accurate',
  'state-of-the-art',
  'secure',
  'blockchain',
];
const NEVER_LIST = ['ROS 2', 'Gazebo', 'Nav2', 'SLAM', 'PostgreSQL', 'SQLite'];
// Keys that hold identifiers, not prose shown to readers.
const ID_KEYS = new Set(['id', 'slug', 'projectId', 'file', 'cover', 'image']);
const URL_KEY = /(url|^linkedin|^github)$/i;

/**
 * @param {Record<string, any>} data  the module namespace of profile.js
 * @returns {{ errors: string[], warnings: string[], unconfirmed: string[] }}
 */
export function validate(data) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const unconfirmed = [];

  // 1. Walk everything: TO_CONFIRM paths, URL scheme, banned words.
  walk(data, '', (value, at, key, project) => {
    if (value === TO_CONFIRM) {
      unconfirmed.push(at);
      return;
    }
    if (typeof value !== 'string') return;
    if (URL_KEY.test(key) && !value.startsWith('https://')) {
      errors.push(`${at}: URL must use https:// (got "${value}")`);
    }
    if (ID_KEYS.has(key) || URL_KEY.test(key)) return;
    for (const word of bannedHits(value)) {
      const backed = project?.evidence?.some((e) => e.claim === word);
      if (!backed) errors.push(`${at}: banned word "${word}" without an evidence link`);
    }
    if (/detect\w*\s+(fatigue|mental state)/i.test(value)) {
      errors.push(`${at}: do not claim fatigue or mental-state detection`);
    }
  });

  // 2. Projects.
  const projects = /** @type {any[]} */ (data.projects ?? []);
  const ids = new Set();
  projects.forEach((p, i) => {
    const at = `projects[${i}]`;
    if (!KEBAB.test(p.id ?? '')) errors.push(`${at}.id: must be kebab-case`);
    if (ids.has(p.id)) errors.push(`${at}.id: duplicate "${p.id}"`);
    ids.add(p.id);
    if (!STATUSES.includes(p.status)) errors.push(`${at}.status: invalid "${String(p.status)}"`);
    if (!CATEGORIES.includes(p.category)) errors.push(`${at}.category: invalid`);
    if (!nonEmpty(p.summary)) errors.push(`${at}.summary: required`);
    if (!nonEmpty(p.title)) errors.push(`${at}.title: required`);
    if (!(p.tech ?? []).some(nonEmpty))
      errors.push(`${at}.tech: needs at least one confirmed item`);
    if (p.status !== 'planned') {
      if (!p.caseStudy) errors.push(`${at}.caseStudy: required for non-planned projects`);
      else if (!(p.caseStudy.limitations ?? []).some(nonEmpty)) {
        errors.push(`${at}.caseStudy.limitations: at least one honest limitation is required`);
      }
    }
    for (const [j, m] of (p.metrics ?? []).entries()) {
      if (!nonEmpty(m.measuredOn)) errors.push(`${at}.metrics[${j}]: needs measuredOn`);
    }
    if (p.status === 'ongoing' && !(p.metrics ?? []).length) {
      walk(p, at, (v, where) => {
        if (typeof v === 'string' && /\b(mAP|FPS)\b\s*[:=]?\s*\d|\d+(\.\d+)?\s*%/.test(v)) {
          errors.push(`${where}: ongoing project quotes a score without measured metrics`);
        }
      });
    }
  });

  // 3. Now building.
  const nb = data.nowBuilding;
  if (nb) {
    if (!ids.has(nb.projectId)) errors.push('nowBuilding.projectId: no matching project');
    (nb.steps ?? []).forEach((s, i) => {
      if (s.state !== TO_CONFIRM && !STEP_STATES.includes(s.state)) {
        errors.push(`nowBuilding.steps[${i}].state: use done | active | todo`);
      }
    });
    if (nb.demoLive && !nonEmpty(nb.demoUrl)) errors.push('nowBuilding: demoLive needs demoUrl');
  }

  // 4. Profile, skills, files.
  const prof = data.profile ?? {};
  if (!EMAIL.test(prof.email ?? '')) errors.push('profile.email: invalid');
  if (typeof prof.showPhone !== 'boolean') errors.push('profile.showPhone: must be boolean');
  (data.skills ?? []).forEach((g, i) =>
    g.skills.forEach((s, j) => {
      if (!['used', 'exposure'].includes(s.level)) errors.push(`skills[${i}].skills[${j}].level`);
      if (NEVER_LIST.some((n) => s.name.toLowerCase().includes(n.toLowerCase()))) {
        errors.push(`skills[${i}].skills[${j}]: "${s.name}" must not be listed until built`);
      }
    }),
  );
  (data.cvs ?? []).forEach((cv, i) => {
    if (!existsSync(path.join(ROOT, 'public', cv.file))) {
      warnings.push(`cvs[${i}]: ${cv.file} is missing — its button will be hidden`);
    }
  });

  return { errors, warnings, unconfirmed };
}

/**
 * Banned words in a string, ignoring negated mentions such as "not a decentralised blockchain".
 * @param {string} text
 */
export function bannedHits(text) {
  /** @type {string[]} */ const hits = [];
  for (const word of BANNED) {
    const re = new RegExp(`\\b${word.replace(/-/g, '\\-')}\\b`, 'gi');
    for (const m of text.matchAll(re)) {
      const before = text.slice(Math.max(0, (m.index ?? 0) - 30), m.index);
      if (!/\b(not|no|never)\b[^.;]*$/i.test(before)) hits.push(word);
    }
  }
  return [...new Set(hits)];
}

/** @param {unknown} v */
function nonEmpty(v) {
  return typeof v === 'string' && v.trim() !== '';
}

/**
 * Depth-first walk calling `visit(value, path, key, project)` for every leaf.
 * @param {any} node @param {string} at
 * @param {(value: any, at: string, key: string, project?: any) => void} visit
 * @param {string} [key] @param {any} [project]
 */
function walk(node, at, visit, key = '', project = undefined) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${at}[${i}]`, visit, key, project));
  } else if (node && typeof node === 'object') {
    const owner = at.match(/^projects\[\d+\]$/) ? node : project;
    for (const [k, v] of Object.entries(node)) walk(v, at ? `${at}.${k}` : k, visit, k, owner);
  } else {
    visit(node, at, key, project);
  }
}

async function main() {
  const strict = process.argv.includes('--strict');
  const data = await import(pathToFileURL(path.join(ROOT, 'src/data/profile.js')).href);
  const { errors, warnings, unconfirmed } = validate({ ...data });

  for (const w of warnings) console.warn(`warn  ${w}`);
  if (unconfirmed.length) {
    console.log(`\nTO_CONFIRM (${unconfirmed.length}) — hidden on the site until confirmed:`);
    for (const u of unconfirmed) console.log(`  - ${u}`);
  }
  for (const e of errors) console.error(`error ${e}`);

  const failed = errors.length > 0 || (strict && unconfirmed.length > 0);
  console.log(
    `\n${failed ? 'FAIL' : 'OK'}: ${errors.length} error(s), ${warnings.length} warning(s), ` +
      `${unconfirmed.length} unconfirmed${strict ? ' (strict)' : ''}`,
  );
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
