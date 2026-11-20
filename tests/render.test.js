// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../src/data/profile.js';
import { TO_CONFIRM } from '../src/data/confirm.js';
import { escapeHtml, safeUrl, extLink } from '../src/render/util.js';
import {
  createContext,
  renderSections,
  renderHead,
  renderHeader,
  renderFooter,
} from '../src/render/index.js';
import { heroStats } from '../src/render/hero.js';
import { stepProgress } from '../src/render/now.js';
import { personJsonLd } from '../src/render/head.js';

const ctx = createContext({ ...data }, { year: 2026, today: '2026-11-18' });
const page = [renderHead(ctx), renderHeader(ctx), renderSections(ctx), renderFooter(ctx)].join(
  '\n',
);

test('escapeHtml escapes markup and hides unconfirmed values', () => {
  assert.equal(escapeHtml('<script>"x" & \'y\''), '&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;');
  assert.equal(escapeHtml(TO_CONFIRM), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(0), '0');
});

test('safeUrl only allows https, mailto and same-site URLs', () => {
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('http://example.com'), '');
  assert.equal(safeUrl('//evil.example'), '');
  assert.equal(safeUrl(TO_CONFIRM), '');
  assert.equal(safeUrl('https://github.com/Jatheel'), 'https://github.com/Jatheel');
  assert.equal(safeUrl('#projects'), '#projects');
  assert.equal(extLink(TO_CONFIRM, 'Repo'), '');
  assert.match(extLink('https://a.example', 'A'), /rel="noopener noreferrer"/);
});

test('rendered page never leaks sentinels or broken values', () => {
  for (const bad of ['TO_CONFIRM', 'Symbol(', 'undefined', '[object Object]', 'NaN', 'null']) {
    assert.ok(!page.includes(bad), `page contains "${bad}"`);
  }
});

test('privacy: phone is hidden by default, no WhatsApp link', () => {
  assert.equal(data.profile.showPhone, false);
  assert.ok(!page.includes('tel:'));
  assert.ok(!page.includes(data.profile.phone));
  assert.ok(!/wa\.me|whatsapp/i.test(page));
});

test('every non-planned project shows a status badge and has a case study', () => {
  for (const p of data.projects.filter((x) => x.status !== 'planned')) {
    assert.ok(page.includes(`data-project="${p.id}"`), p.id);
    assert.ok(page.includes(`id="project/${p.id}"`), `${p.id} case study`);
  }
  assert.ok(page.includes('badge--ongoing'));
  assert.ok(page.includes('badge--completed'));
});

test('planned "up next" items stay hidden unless enabled', () => {
  assert.equal(data.site.showUpNext, false);
  for (const u of data.upNext) assert.ok(!page.includes(u.title), u.title);
});

test('hero stats are derived from the data', () => {
  const [completed, years, classes] = heroStats(ctx);
  assert.equal(completed.value, data.projects.filter((p) => p.status === 'completed').length);
  assert.equal(years.value, 2026 - 2023);
  assert.equal(classes.value, 61);
});

test('progress bar only appears once every step state is confirmed', () => {
  assert.equal(stepProgress(data.nowBuilding.steps), null);
  const steps = [
    { label: 'a', state: 'done' },
    { label: 'b', state: 'active' },
    { label: 'c', state: 'todo', optional: true },
  ];
  assert.deepEqual(stepProgress(/** @type {any} */ (steps)), { done: 1, total: 2 });
});

test('JSON-LD cannot break out of its script tag', () => {
  const evil = createContext({
    ...data,
    site: { ...data.site, description: '</script><script>alert(1)</script>' },
  });
  const json = personJsonLd(evil);
  assert.ok(!json.includes('<'));
  assert.equal(JSON.parse(json).description, '</script><script>alert(1)</script>');
});

test('demo button appears only when demoLive and a URL are set', () => {
  assert.ok(!page.includes('Try the live demo'));
  const live = createContext({
    ...data,
    nowBuilding: {
      ...data.nowBuilding,
      demoLive: true,
      demoUrl: /** @type {any} */ ('https://huggingface.co/spaces/x/y'),
    },
  });
  assert.ok(renderSections(live).includes('Try the live demo'));
});
