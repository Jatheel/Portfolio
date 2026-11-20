// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../src/data/profile.js';
import { TO_CONFIRM } from '../src/data/confirm.js';
import { validate, bannedHits } from '../scripts/check-data.js';

test('seed data passes validation', () => {
  const { errors, unconfirmed } = validate({ ...data });
  assert.deepEqual(errors, []);
  assert.ok(unconfirmed.includes('site.url'));
});

test('banned words are caught, honest negations are not', () => {
  assert.deepEqual(bannedHits('An expert in state-of-the-art models'), [
    'expert',
    'state-of-the-art',
  ]);
  assert.deepEqual(bannedHits('Hash-linked log — not a decentralised blockchain'), []);
  assert.deepEqual(bannedHits('A blockchain ledger'), ['blockchain']);
});

test('rules: http URLs, metrics without measuredOn, missing limitations, bad ids', () => {
  const bad = {
    ...data,
    profile: { ...data.profile, github: 'http://github.com/x' },
    projects: [
      {
        ...data.projects[0],
        id: 'Bad Id',
        metrics: [{ name: 'mAP', value: '0.9', measuredOn: '' }],
        caseStudy: { ...data.projects[0].caseStudy, limitations: [] },
      },
    ],
    nowBuilding: { ...data.nowBuilding, projectId: 'Bad Id' },
  };
  const { errors } = validate(bad);
  assert.ok(errors.some((e) => e.includes('https://')));
  assert.ok(errors.some((e) => e.includes('kebab-case')));
  assert.ok(errors.some((e) => e.includes('measuredOn')));
  assert.ok(errors.some((e) => e.includes('limitation')));
});

test('ongoing projects cannot quote scores, skills never list unbuilt tools', () => {
  const bad = {
    ...data,
    projects: [{ ...data.projects[0], summary: 'Detector with 92% mAP' }],
    skills: [{ name: 'Robotics', skills: [{ name: 'ROS 2', level: 'used' }] }],
  };
  const { errors } = validate(bad);
  assert.ok(errors.some((e) => e.includes('without measured metrics')));
  assert.ok(errors.some((e) => e.includes('ROS 2')));
});

test('unconfirmed values are reported with their path', () => {
  const { unconfirmed } = validate({ ...data, site: { ...data.site, url: TO_CONFIRM } });
  assert.ok(unconfirmed.includes('site.url'));
  assert.ok(unconfirmed.includes('profile.location'));
});
