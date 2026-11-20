// @ts-check
/**
 * Vite plugin: renders every section from src/data/profile.js into index.html at build time
 * (and on each dev request), so the page is complete without JavaScript. In production it also
 * preloads the two main font files, adds a hash-based Content-Security-Policy and emits
 * robots.txt and sitemap.xml.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MARKERS = ['HEAD', 'HEADER', 'SECTIONS', 'FOOTER', 'DIALOGS'];
const PRELOAD_FONTS = [
  /ibm-plex-sans-latin-400-normal[^/]*\.woff2$/,
  /sora-latin-700-normal[^/]*\.woff2$/,
];

/**
 * Until site.url is confirmed in profile.js, take it from the build environment: SITE_URL, or
 * the production domain Vercel exposes. Canonical/OG URLs then point at production even on
 * preview deployments. Anything that is not a plain https origin(+path) is ignored.
 */
function envSiteUrl() {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const raw = process.env.SITE_URL || (vercel ? `https://${vercel}` : '');
  return /^https:\/\/[a-z0-9.-]+(:\d+)?(\/[\w.~-]+)*\/?$/i.test(raw) ? raw : '';
}

/** @returns {import('vite').Plugin} */
export function prerender() {
  /** @type {import('vite').ViteDevServer | undefined} */
  let server;
  let root = process.cwd();
  /** @type {any} */
  let last;

  /** @param {string} rel */
  async function load(rel) {
    if (server) return server.ssrLoadModule(`/${rel}`);
    return import(pathToFileURL(path.join(root, rel)).href);
  }

  async function context() {
    const data = await load('src/data/profile.js');
    const render = await load('src/render/index.js');
    const manifestPath = path.join(root, 'src/data/image-manifest.json');
    const images = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
    const availableCvs = data.cvs.filter((/** @type {{ file: string }} */ cv) => {
      const ok = existsSync(path.join(root, 'public', cv.file));
      if (!ok) console.warn(`[prerender] ${cv.file} not found — hiding that CV button`);
      return ok;
    });
    const fromEnv = !server && typeof data.site.url !== 'string' ? envSiteUrl() : '';
    const site = fromEnv ? { ...data.site, url: fromEnv } : data.site;
    const ctx = render.createContext({ ...data, site }, { availableCvs, images });
    return { ctx, render };
  }

  return {
    name: 'portfolio-prerender',
    configResolved(config) {
      root = config.root;
    },
    configureServer(s) {
      server = s;
      // Content and renderer edits change the HTML itself, so reload the page.
      s.watcher.on('change', (file) => {
        const f = file.replace(/\\/g, '/');
        if (/\/src\/(data|render)\//.test(f)) s.ws.send({ type: 'full-reload' });
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const { ctx, render } = await context();
        last = { ctx, render };
        if (!render.siteUrl?.(ctx) && !server) {
          console.warn(
            '[prerender] site.url is TO_CONFIRM and no valid SITE_URL — no canonical URL or sitemap',
          );
        }
        const parts = {
          HEAD: render.renderHead(ctx),
          HEADER: render.renderHeader(ctx),
          SECTIONS: render.renderSections(ctx),
          FOOTER: render.renderFooter(ctx),
          DIALOGS: render.renderDialogs(),
        };
        let out = html;
        for (const key of MARKERS) out = out.replace(`<!--${key}-->`, () => parts[key]);
        return out;
      },
    },
    generateBundle() {
      if (!last) return;
      const { ctx, render } = last;
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: render.renderRobots(ctx) });
      const sitemap = render.renderSitemap(ctx);
      if (sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

/** Production-only HTML hardening; runs after Vite has injected its own tags. */
/** @returns {import('vite').Plugin} */
export function securityHeaders() {
  return {
    name: 'portfolio-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const assets = Object.keys(ctx.bundle ?? {});
        const preloads = PRELOAD_FONTS.map((re) => assets.find((a) => re.test(a)))
          .filter(Boolean)
          .map((f) => `<link rel="preload" href="./${f}" as="font" type="font/woff2" crossorigin>`)
          .join('\n');

        const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
          .filter(([, attrs]) => !/application\/ld\+json/.test(attrs))
          .map(([, , body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`);

        // frame-ancestors cannot be set from a meta tag; vercel.json sends it as a header.
        const csp = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(' ')}`,
          "style-src 'self'",
          "img-src 'self' data:",
          "font-src 'self' data:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

        return html.replace(
          /<meta charset="utf-8" \/>/,
          (m) => `${m}\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n${preloads}`,
        );
      },
    },
  };
}
