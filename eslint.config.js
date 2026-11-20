// ESLint 9 uses flat config, so this replaces the `.eslintrc.cjs` named in CLAUDE.md.
import js from '@eslint/js';

const browser = Object.fromEntries(
  [
    'window',
    'document',
    'navigator',
    'location',
    'history',
    'localStorage',
    'sessionStorage',
    'matchMedia',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'requestIdleCallback',
    'setTimeout',
    'setInterval',
    'clearInterval',
    'clearTimeout',
    'performance',
    'IntersectionObserver',
    'ResizeObserver',
    'HTMLElement',
    'HTMLCanvasElement',
    'HTMLDialogElement',
    'HTMLAnchorElement',
    'HTMLButtonElement',
    'HTMLImageElement',
    'Element',
    'Event',
    'KeyboardEvent',
    'PointerEvent',
    'FocusEvent',
    'Comment',
    'CustomEvent',
    'getComputedStyle',
    'console',
    'URL',
  ].map((name) => [name, 'readonly']),
);

const node = Object.fromEntries(
  ['process', 'console', 'URL', 'Buffer'].map((name) => [name, 'readonly']),
);

export default [
  { ignores: ['dist/**', 'node_modules/**', '.lighthouseci/**', 'public/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: browser },
    rules: {
      'no-console': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
  {
    // Render functions and data run in Node at build time too, so they must not touch the DOM.
    files: ['src/render/**/*.js', 'src/data/**/*.js'],
    languageOptions: { globals: {} },
  },
  {
    files: ['scripts/**/*.js', 'tests/**/*.js', '*.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: node },
    rules: { 'no-console': 'off' },
  },
];
