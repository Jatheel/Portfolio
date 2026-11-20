// @ts-check
import { esc, isSet } from './util.js';

/** @typedef {import('./index.js').RenderContext} RenderContext */

/** @param {RenderContext} ctx */
export function siteUrl(ctx) {
  const url = /** @type {unknown} */ (ctx.data.site.url);
  return isSet(url) && typeof url === 'string' ? url.replace(/\/+$/, '') : '';
}

/**
 * JSON-LD Person built from the profile. `<` is escaped so the block can never close the script.
 * @param {RenderContext} ctx
 */
export function personJsonLd(ctx) {
  const { profile, education } = ctx.data;
  const url = siteUrl(ctx);
  /** @type {Record<string, unknown>} */
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: 'AI Undergraduate',
    description: ctx.data.site.description,
    email: `mailto:${profile.email}`,
    sameAs: [profile.linkedin, profile.github],
    knowsAbout: profile.focusAreas,
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Moratuwa',
      department: education[0]?.institution,
    },
  };
  if (url) person.url = `${url}/`;
  if (url) person.image = `${url}/og.png`;
  return JSON.stringify(person).replace(/</g, '\\u003c');
}

/** @param {RenderContext} ctx */
export function renderHead(ctx) {
  const { profile, site } = ctx.data;
  const url = siteUrl(ctx);
  const title = `${profile.name} — AI, Computer Vision & Robotics`;
  const desc = site.description;
  // Absolute URLs need the confirmed site URL; relative fallbacks keep previews working meanwhile.
  const og = url ? `${url}/og.png` : './og.png';
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<meta name="author" content="${esc(profile.name)}">`,
    url ? `<link rel="canonical" href="${esc(url)}/">` : '',
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    url ? `<meta property="og:url" content="${esc(url)}/">` : '',
    `<meta property="og:image" content="${esc(og)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(profile.name)} — circuit board turning into a neural network">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`,
    `<meta name="twitter:image" content="${esc(og)}">`,
    `<meta name="theme-color" content="#F6F7F4" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#0B100E" media="(prefers-color-scheme: dark)">`,
    `<script type="application/ld+json">${personJsonLd(ctx)}</script>`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * sitemap.xml — only possible once the site URL is confirmed.
 * @param {RenderContext} ctx
 */
export function renderSitemap(ctx) {
  const url = siteUrl(ctx);
  if (!url) return '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${esc(url)}/</loc><lastmod>${ctx.today}</lastmod></url>
</urlset>
`;
}

/** @param {RenderContext} ctx */
export function renderRobots(ctx) {
  const url = siteUrl(ctx);
  return `User-agent: *\nAllow: /\n${url ? `Sitemap: ${url}/sitemap.xml\n` : ''}`;
}
