// @ts-check
import { defineConfig } from 'vite';
import { prerender, securityHeaders } from './scripts/prerender-plugin.js';

export default defineConfig({
  // Relative base so the same build works on Vercel and on a GitHub Pages sub-path.
  base: './',
  plugins: [prerender(), securityHeaders()],
  server: { host: true },
  build: {
    target: 'es2022',
    // Never inline assets as data: URIs; keeps the CSP simple and caching effective.
    assetsInlineLimit: 0,
    // three is a single lazily loaded chunk; its gzip size is enforced by check-budget.js.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          return undefined;
        },
      },
    },
  },
});
