# Mohamed Jatheel — Portfolio

Single-page portfolio for AI/ML, computer vision and robotics internships. A 3D circuit board
rewires into a neural network as you scroll, and every project shows whether it is
**Completed**, **Ongoing** or **Planned**.

- All content lives in one file: [`src/data/profile.js`](src/data/profile.js).
- Sections are rendered into the HTML at build time, so the site is complete without JavaScript
  and readable by search engines. JavaScript only enhances it.
- The 3D scene (Three.js) loads last, only with WebGL2. Without WebGL2, or with reduced motion
  turned on, the site falls back to a static circuit background or a still frame.

## Quick start

Requires Node 22 or newer (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:5173, also on your LAN for phone testing
npm run build        # prerender + bundle into dist/, then check the JS size budgets
npm run preview      # serve dist/
```

| Command                          | What it does                                                          |
| -------------------------------- | --------------------------------------------------------------------- |
| `npm run lint`                   | ESLint + Prettier check + type check (`tsc` on JSDoc types)           |
| `npm test`                       | Unit tests (Node's built-in runner): escaping, privacy, data rules    |
| `npm run check:data`             | Validates `profile.js` and lists every open `TO_CONFIRM` fact         |
| `npm run check:data -- --strict` | Fails while any `TO_CONFIRM` remains (CI uses this on `main`)         |
| `npm run images`                 | `assets-src/` → AVIF + WebP at 480/800/1200/1600 px, plus `og.png`    |
| `npm run check:links`            | Checks every link in `dist/`                                          |
| `npx lhci autorun`               | Lighthouse CI against `dist/` with the budgets in `lighthouserc.json` |

## Updating content

Edit only `src/data/profile.js`, then run `npm run check:data && npm run build`.

- **Unknown facts** use the `TO_CONFIRM` sentinel. The page hides those fields, and
  `check:data` prints where each one is (for example `projects[3].period`).
- **CV PDFs** go in `public/cv/` with the file names listed in `cvs`. A missing file hides its
  button, and the build prints a warning.
- **Screenshots and photos**: put the originals in `assets-src/projects/<cover>.png`,
  `assets-src/lab/<image>.jpg` or `assets-src/profile/<photo>.jpg` and run `npm run images`.
  Then set `cover`, `lab[i].image` or `profile.photo`. Lab items without an image stay hidden
  from the gallery.
- **CircuitCoach milestones**: set each step's `state` to `done`, `active` or `todo`. The
  progress bar appears once every step has a state. When the Space is public, set
  `demoLive: true` and `demoUrl`.
- **Metrics** only with `measuredOn` (which test set, and the date). The data check rejects
  scores on an ongoing project that has no measured metrics.

## Project structure

```
index.html              skeleton with <!--HEAD--> <!--SECTIONS--> … markers
vite.config.js          prerender + CSP plugins, chunking
scripts/                prerender plugin, data check, image pipeline, JS budget check
src/data/               profile.js (all content), types, TO_CONFIRM sentinel
src/render/             pure data → HTML functions (escape everything, skip TO_CONFIRM)
src/ui/                 progressive enhancement: theme, nav, filters, drawer, lightbox, …
src/scene/              Three.js scene: layouts, nodes, pulses, camera, scroll binding
src/styles/             tokens, base, layout, components, sections, motion
tests/                  node --test unit tests
```

## Security and privacy

- **Content-Security-Policy**: `script-src 'self'` plus a SHA-256 hash of the one inline
  theme script, computed at build time. Also `style-src 'self'` (no inline styles anywhere) and
  `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`. `vercel.json` adds
  `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, HSTS and COOP.
- All rendered text is HTML-escaped. URLs must be `https:` (or `mailto:` or same-site),
  external links use `rel="noopener noreferrer"`, and JSON-LD escapes `<`.
- No analytics, no third-party requests, and the fonts are self-hosted. The phone number is
  off by default (`showPhone: false`), and there is no WhatsApp link or street address.
- The image pipeline strips photo metadata (including GPS) by default.
- Lighthouse reports are written to `.lighthouseci/` locally; they are never uploaded to
  public storage.
- `npm audit --omit=dev` reports 0 vulnerabilities in the shipped code. The remaining advisories
  are in dev-only tooling (Vite's file globbing, linkinator), which only reads patterns written
  in this repo.

## Deploy

**Vercel**: import the repository. `vercel.json` sets the build command, the output folder
(`dist`) and the security headers. **GitHub Pages**: `base: './'` makes the same `dist/` work
from a sub-path, but security headers then come only from the meta CSP.

The site URL drives the canonical link, absolute Open Graph URLs and `sitemap.xml`. Until
`site.url` is set in `profile.js`, the build uses the `SITE_URL` environment variable, or on
Vercel the project's production domain automatically. Set `site.url` once the domain is final.

### First deploy (Vercel)

1. Create a **private** GitHub repository. `profile.js` and `CLAUDE.md` contain the phone
   number (it is never rendered, but a public repo would publish it).
2. `git remote add origin https://github.com/<you>/<repo>.git` then `git push -u origin main`.
3. On vercel.com: **Add New → Project**, import the repo. Vercel reads `vercel.json`; leave the
   framework/build settings as detected. Node comes from `engines` (22+).
4. Open the deployment, check the response headers and that `/sitemap.xml` exists.
5. Optional custom domain: add it in Vercel, then set `site.url` to it and push.

CI runs `check:data --strict` on `main`, so it stays red until every `TO_CONFIRM` is resolved.
That does not block Vercel deployments.

## Deviations from CLAUDE.md (and why)

- **ESLint 9 flat config** (`eslint.config.js`) instead of `.eslintrc.cjs`. ESLint 9 no longer
  reads `.eslintrc`.
- **Node 22 in CI** instead of 20: Node 20 is end-of-life, and linkinator 8 needs Node 22 or newer.
- **GSAP removed.** Scroll binding is a small passive listener (`src/scene/scroll.js`) with a
  `power2.inOut` morph. ScrollTrigger's refresh caused a ~0.5 s long task on throttled mobile,
  which made the Lighthouse ≥ 90 target unreachable; removing it also saves 44 KB gzip.
- **Scene start**: after `load` + idle, on the first interaction or 3.5 s later, whichever
  comes first. Creating a WebGL context is a ~100 ms task, and this keeps it out of the first
  seconds of reading.
- **No bloom pass.** Dark mode uses additive blending with a soft halo in the point shader,
  which looks similar without the extra post-processing code.
- **Frame cap**: the scene renders at up to 60 fps on desktop and 30 fps on phones and
  low-power devices.
- **`src/data/profile.js` is over 250 lines** on purpose: it is a content file, and keeping
  every fact in one place matters more than the line limit.
- Extra dev dependencies for typing and linting only: `@eslint/js`, `@types/three`, `@types/node`.

## Credits

Concept inspired by Sheraz Ahmad's portfolio
([github.com/25sheraz/sheraz-portfolio](https://github.com/25sheraz/sheraz-portfolio)). No code,
text, images, palette or fonts were copied; everything here was written from scratch.

CircuitCoach AI dataset: ElectroCom61, Sayeedi et al., _Data in Brief_ 59 (2025) 111331,
CC BY 4.0.
