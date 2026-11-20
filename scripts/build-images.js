// @ts-check
/**
 * Image pipeline (npm run images):
 *  - assets-src/{projects,lab,profile}/*.png|jpg → public/img/<dir>/<name>-<w>.avif|webp
 *    at 480/800/1200/1600 px (never upscaled), plus src/data/image-manifest.json
 *  - public/og.png (1200×630 social card) and public/apple-touch-icon.png, drawn from SVG here
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'assets-src');
const OUT = path.join(ROOT, 'public/img');
const MANIFEST = path.join(ROOT, 'src/data/image-manifest.json');
const WIDTHS = [480, 800, 1200, 1600];
const DIRS = ['projects', 'lab', 'profile'];

/** @param {string} p */
const mtime = (p) => (existsSync(p) ? statSync(p).mtimeMs : 0);

async function photos() {
  /** @type {Record<string, { w: number, h: number, widths: number[] }>} */
  const manifest = {};
  for (const dir of DIRS) {
    const from = path.join(SRC, dir);
    if (!existsSync(from)) continue;
    mkdirSync(path.join(OUT, dir), { recursive: true });
    for (const file of readdirSync(from).filter((f) => /\.(png|jpe?g)$/i.test(f))) {
      const name = path
        .parse(file)
        .name.toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-');
      const input = path.join(from, file);
      const meta = await sharp(input).rotate().metadata();
      const srcW = meta.autoOrient?.width ?? meta.width ?? 0;
      const srcH = meta.autoOrient?.height ?? meta.height ?? 0;
      let widths = WIDTHS.filter((w) => w <= srcW);
      if (!widths.length) widths = [srcW];
      for (const w of widths) {
        for (const ext of /** @type {const} */ (['avif', 'webp'])) {
          const out = path.join(OUT, dir, `${name}-${w}.${ext}`);
          if (mtime(out) > mtime(input)) continue;
          // rotate() applies EXIF orientation; metadata (incl. GPS) is stripped by default.
          const img = sharp(input).rotate().resize({ width: w });
          await (ext === 'avif' ? img.avif({ quality: 50 }) : img.webp({ quality: 78 })).toFile(
            out,
          );
        }
      }
      const top = widths[widths.length - 1];
      manifest[`${dir}/${name}`] = { w: top, h: Math.round((srcH * top) / srcW), widths };
      console.log(`  ${dir}/${file} → ${widths.join(', ')} px`);
    }
  }
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`manifest: ${Object.keys(manifest).length} image(s)`);
}

/** @param {string} s */
const xml = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

async function socialCard() {
  const { profile } = await import(pathToFileURL(path.join(ROOT, 'src/data/profile.js')).href);
  // Grid traces on the left morph into network layers on the right — the site's idea in one frame.
  const traces = [];
  for (let k = 0; k < 9; k++) {
    const y = 90 + k * 52;
    const turn = 140 + ((k * 73) % 220);
    traces.push(`<path d="M0 ${y}H${turn}V${y + (k % 2 ? 26 : -26)}H${520 + (k % 3) * 20}"/>`);
  }
  const layers = [6, 8, 8, 4].map((c, l) =>
    Array.from({ length: c }, (_, i) => [820 + l * 110, 315 + (i - (c - 1) / 2) * 62]),
  );
  const links = [];
  for (let l = 0; l < 3; l++) {
    for (const [x1, y1] of layers[l]) {
      for (const [x2, y2] of layers[l + 1].filter((_, i) => (i + l) % 2 === 0)) {
        links.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
      }
    }
  }
  const nodes = layers.flat().map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0B100E"/>
<g fill="none" stroke="#E09254" stroke-opacity="0.35" stroke-width="3">${traces.join('')}</g>
<g stroke="#E09254" stroke-opacity="0.35" stroke-width="2">${links.join('')}</g>
<g fill="#3CCB9A">${nodes.join('')}</g>
<rect x="64" y="150" width="660" height="330" rx="16" fill="#0B100E" fill-opacity="0.86"/>
<text x="96" y="250" font-family="Sora, 'Segoe UI', Arial, sans-serif" font-weight="700" font-size="72" fill="#E6EEE9">${xml(profile.name)}</text>
<text x="98" y="310" font-family="'JetBrains Mono', Consolas, monospace" font-size="24" fill="#E09254">AI · Computer Vision · LLM Apps · Robotics</text>
<text x="98" y="380" font-family="'IBM Plex Sans', 'Segoe UI', Arial, sans-serif" font-size="28" fill="#93A39A">AI undergraduate, University of Moratuwa</text>
<text x="98" y="425" font-family="'IBM Plex Sans', 'Segoe UI', Arial, sans-serif" font-size="28" fill="#93A39A">Projects · case studies · teaching</text>
</svg>`;
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(path.join(ROOT, 'public/og.png'));
  await sharp(readFileSync(path.join(ROOT, 'public/favicon.svg')), { density: 300 })
    .resize(180, 180)
    .flatten({ background: '#F6F7F4' })
    .png()
    .toFile(path.join(ROOT, 'public/apple-touch-icon.png'));
  console.log('og.png and apple-touch-icon.png written');
}

await photos();
await socialCard();
