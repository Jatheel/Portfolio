# CLAUDE.md — Mohamed Jatheel · Portfolio

This file is the brief for building and maintaining Mohamed Jatheel's personal portfolio site.
Read all of it before writing code. Work **one phase at a time** (see "Build phases"), then stop and
show the result.

---

## 1. Mission

A single-page portfolio that gets Jatheel shortlisted for **AI/ML, computer vision and robotics
internships**. It must:

1. Load fast and read well on a phone (recruiters often open links on mobile).
2. Make the strongest work obvious in 10 seconds: who he is, what he builds, proof (repos, demos).
3. Be memorable: a 3D **circuit board that rewires into a neural network** as you scroll —
   AI + electronics + robotics teaching in one image.
4. Be **truthful**: every project shows whether it is Completed, Ongoing or Planned.

Concept credit: the "one data file drives a scroll-reactive 3D scene" idea was inspired by
Sheraz Ahmad's portfolio (github.com/25sheraz/sheraz-portfolio). That repo has **no licence**.

---

## 2. Non-negotiables

### 2.1 Originality
- Write every file from scratch. **Do not copy code, CSS, markup, text, images, palette, loader,
  or font pairing** from the reference repo. Do not clone it into this folder or fetch its files.
- Use only the idea-level patterns listed in section 4.
- Put "Concept inspired by Sheraz Ahmad's portfolio" in the README credits.

### 2.2 Truthfulness (applies to all content you write)
- Use only facts in `src/data/profile.js` (seeded from section 11). Never invent metrics, accuracy,
  users, dates, awards, employers, links or features.
- Status vocabulary, exactly: `completed` · `ongoing` · `planned`. Planned items never appear among
  completed work. Skills marked `exposure` are shown as exposure, not proficiency.
- Unknown facts are the sentinel `TO_CONFIRM` (exported from `src/data/confirm.js`). The UI must
  **never render** a `TO_CONFIRM` value — hide that field instead.
- Banned words unless backed by evidence in the data: "expert", "production-ready", "highly accurate",
  "state-of-the-art", "secure" (as an unqualified claim), "blockchain" (see Secure File Sharing).
- CircuitCoach AI is **ongoing**: no mAP/FPS/accuracy until `metrics` is filled with measured values.
- SmartDesk: never claim it detects fatigue or mental state reliably; say "focus and idle patterns".

### 2.3 Privacy
- Phone number is **off by default** (`profile.showPhone = false`). No WhatsApp link. No street address.
- No analytics or third-party trackers. If analytics is ever added, it must be cookieless and opt-in.
- Self-host fonts (no Google Fonts requests).

### 2.4 Process
- One phase per request. After each phase: run `npm run lint`, `npm run check:data`, `npm run build`,
  then summarise what changed and what the owner should look at.
- Ask before adding any dependency not listed in section 3.
- Never commit secrets. There are no secrets in this project; keep it that way.

---

## 3. Stack and commands

| Tool | Use |
|---|---|
| Vite 5+ | Dev server and build (static output in `dist/`) |
| Plain JavaScript (ES modules) | All code. JSDoc types + `// @ts-check`; `jsconfig.json` with `checkJs: true` |
| three | WebGL scene (dynamically imported after first paint) |
| gsap (+ ScrollTrigger) | Scroll binding and transitions |
| @fontsource/* | Self-hosted fonts |
| eslint, prettier, typescript (type check only, `tsc --noEmit`) | Quality |
| sharp | Image pipeline script (dev dependency) |
| linkinator | Link check (dev dependency) |
| @lhci/cli | Lighthouse CI (dev dependency) |

No UI framework, no Tailwind, no CSS-in-JS. Plain CSS with custom properties.

```bash
npm install
npm run dev          # local dev, also exposed on LAN for phone testing
npm run lint         # eslint + prettier --check + tsc --noEmit
npm run check:data   # validates profile.js; lists TO_CONFIRM items (warn)
npm run check:data -- --strict   # fails if any TO_CONFIRM remains (used in CI on main)
npm run images       # assets-src/ -> public/img/ (AVIF + WebP, 480/800/1200/1600 widths)
npm run build        # prerender content + bundle
npm run preview
npm run check:links  # linkinator against dist/
```

Node 20 LTS. Deploy target: Vercel (static). `vite.config.js` uses `base: './'` so GitHub Pages also works.

---

## 4. Architecture

### 4.1 Patterns adopted (idea level only)
- One data file is the single source of truth for all content.
- Each page section has a matching 3D "layout"; the scene morphs between layouts as you scroll.
- Hovering/focusing a project card or skill group highlights its part of the scene.
- WebGL failure → static background; `prefers-reduced-motion` → no morphing/pulses; low-power
  devices → fewer nodes, no bloom.

### 4.2 Improvements over the reference (must implement)
1. **Build-time rendering.** Section HTML is generated at build time from `profile.js` by a small
   Vite plugin (`transformIndexHtml`) that calls pure render functions. The page is fully readable
   with JavaScript off and indexable by search engines. Client JS only *enhances*.
2. **3D loads last.** First paint is text + CSS background. `three` is dynamically imported after
   `load` + `requestIdleCallback` (fallback `setTimeout 300ms`), only if WebGL2 is available.
3. **Status badges** on every project and **case-study panel** per project (deep-linkable).
4. **Now building** panel driven by `profile.nowBuilding` with a step checklist and a `demoLive` flag.
5. **Two CV downloads** (AI/ML, Computer Vision).
6. **Teaching & Leadership** section and **Arduino lab gallery**.
7. **Theme** follows `prefers-color-scheme`, user choice saved in `localStorage` (try/catch), applied
   by an inline script before first paint (no flash).
8. **SEO**: per-page `<title>`, description, canonical, Open Graph + Twitter tags with a 1200×630
   `og.png`, JSON-LD `Person` (generated from profile), `sitemap.xml`, `robots.txt`.
9. **Derived stats**: numbers in the hero are computed from data (e.g. count of completed projects,
   years teaching since 2023), so they cannot drift from the truth.
10. **CI**: lint, data check (strict on `main`), build, link check, Lighthouse CI budgets.

### 4.3 Folder structure

```
.
├── CLAUDE.md
├── README.md
├── index.html                 # skeleton with <!--SECTIONS--> and <!--HEAD--> markers
├── vite.config.js             # prerender plugin, manualChunks { three, gsap }
├── jsconfig.json  .eslintrc.cjs  .prettierrc  lighthouserc.json
├── scripts/
│   ├── check-data.js          # validation (see 5.3)
│   ├── build-images.js        # sharp pipeline
│   └── prerender-plugin.js    # Vite plugin: injects sections, head tags, JSON-LD, sitemap
├── assets-src/                # original screenshots/photos (not shipped)
│   ├── projects/<id>.(png|jpg)
│   └── lab/<slug>.(png|jpg)
├── public/
│   ├── cv/Mohamed_Jatheel_CV_AI-ML.pdf
│   ├── cv/Mohamed_Jatheel_CV_Computer-Vision.pdf
│   ├── img/…                  # generated
│   ├── og.png  favicon.svg  robots.txt
└── src/
    ├── main.js                # enhancement entry
    ├── data/
    │   ├── confirm.js         # export const TO_CONFIRM = Symbol.for('TO_CONFIRM')
    │   ├── types.js           # JSDoc typedefs (5.1)
    │   └── profile.js         # ALL content (section 11)
    ├── render/                # pure functions: data -> HTML string (no DOM access)
    │   ├── index.js  hero.js  about.js  now.js  projects.js  caseStudy.js
    │   ├── experience.js  leadership.js  skills.js  lab.js  contact.js  head.js  util.js
    ├── ui/
    │   ├── theme.js  nav.js  filters.js  panel.js  copyEmail.js  reveal.js  counters.js  device.js
    ├── scene/
    │   ├── index.js           # lazy entry: createScene({ canvas, palette, quality })
    │   ├── nodes.js           # instanced node points + edge line segments
    │   ├── layouts.js         # one function per section, seeded PRNG
    │   ├── traces.js          # Manhattan (right-angle) edge routing helpers
    │   ├── pulses.js          # signal pulses travelling along edges
    │   ├── camera.js          # per-section camera pose, mobile overrides
    │   └── scroll.js          # GSAP ScrollTrigger -> morph progress
    └── styles/
        ├── tokens.css  base.css  layout.css  components.css  sections.css  motion.css
```

`render/*` functions must escape all text (`util.escapeHtml`) and must skip `TO_CONFIRM` values.

---

## 5. Data model

### 5.1 Types (`src/data/types.js`)

```js
/** @typedef {'completed'|'ongoing'|'planned'} Status */
/** @typedef {'cv'|'genai'|'fullstack'|'automation'|'hardware'} Category */
/** @typedef {{ label: string, url: string }} Link */
/**
 * @typedef {Object} CaseStudy
 * @property {string} problem
 * @property {string} role          // what Jatheel personally did
 * @property {string[]} approach    // 3–6 bullets
 * @property {string} [architecture] // one paragraph; optional diagram image id
 * @property {string} [testing]     // how it was tested/evaluated; omit if not done
 * @property {string[]} limitations // honest limits — required, at least 1
 * @property {string[]} next        // next steps
 */
/**
 * @typedef {Object} Project
 * @property {string} id                 // kebab-case, used in #project/<id>
 * @property {string} title
 * @property {string} subtitle
 * @property {Status} status
 * @property {Category} category
 * @property {boolean} [featured]
 * @property {string} period             // e.g. "2026" or "Nov 2026 – present"
 * @property {string} summary            // 1–2 sentences for the card
 * @property {string[]} tech
 * @property {Link[]} links
 * @property {CaseStudy} [caseStudy]     // required when status !== 'planned'
 * @property {{ name: string, value: string, measuredOn: string }[]} [metrics] // only measured values
 * @property {string} [cover]            // image id in public/img/projects
 */
/** @typedef {{ name: string, level: 'used'|'exposure' }} Skill */
```

### 5.2 Export shape of `profile.js`
`profile`, `nowBuilding`, `projects`, `upNext`, `experience`, `leadership`, `skills`, `lab`,
`education`, `cvs`, `site`. Derived stats live in `render/hero.js`, computed from these.

### 5.3 `scripts/check-data.js` rules
- Every project: unique kebab `id`, valid `status`/`category`, non-empty `summary`, ≥1 `tech`.
- Non-planned projects need `caseStudy` with ≥1 `limitations`.
- `status === 'ongoing'` projects must not have `metrics` unless each has `measuredOn`.
- All URLs are `https://`. Email matches a basic pattern.
- No banned words (2.2) in any string unless the project lists a matching evidence link.
- Report every `TO_CONFIRM` with its path (e.g. `experience[1].period`). `--strict` → exit 1.

---

## 6. Sections (order, ids, behaviour)

| # | id | Content | Scene layout |
|---|---|---|---|
| 1 | `hero` | Name, title line, intro, rotating role words, 3 derived stats, CTAs: "See projects", "Download CV" | `board` |
| 2 | `about` | 2 short paragraphs, focus areas, education card | `chip` |
| 3 | `now` | "Now building": CircuitCoach AI with step checklist, progress bar, demo button if `demoLive` | `detect` |
| 4 | `projects` | Filter chips (All, Computer Vision, GenAI, Full-stack, Automation), cards with status badge; click/Enter opens case-study panel | `neural` |
| 5 | `experience` | Timeline of teaching/tutoring roles | `trace` |
| 6 | `leadership` | Rotaract, students' association | (inherits `trace`) |
| 7 | `skills` | Groups as rings; `exposure` items visually lighter with a legend | `rings` |
| 8 | `lab` | Arduino practicals gallery (lazy images, lightbox) | `rings` → `board` |
| 9 | `contact` | Email (mailto + copy button), LinkedIn, GitHub, two CV buttons; phone only if `showPhone` | `antenna` |

`upNext` (planned ideas) renders only if `site.showUpNext === true`, as a small list inside
`projects`, each labelled "Planned".

### Case-study panel
- Opens as a right-side drawer (full-screen on mobile). URL hash `#project/<id>`; back button closes it.
- Focus trap, `Esc` closes, focus returns to the card. `aria-modal="true"`, labelled by the title.
- Sections: Problem · My role · Approach · Architecture · Testing · Limitations · Next · Links.
  Omit empty ones.

---

## 7. Visual design

### 7.1 Identity: "Circuit → Neural"
Clean and professional first, playful second. The page should read like a well-made engineering
document with a living circuit behind it.

### 7.2 Tokens (`styles/tokens.css`) — original palette

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F6F7F4` | `#0B100E` |
| `--surface` | `#FFFFFF` | `#121915` |
| `--ink` | `#14201B` | `#E6EEE9` |
| `--muted` | `#56635C` | `#93A39A` |
| `--line` | `#D9DFDA` | `#223029` |
| `--accent` (solder-mask green) | `#0F6B52` | `#3CCB9A` |
| `--copper` (traces, highlights) | `#B8662B` | `#E09254` |
| `--signal` (pulses, focus ring) | `#1F7FBF` | `#5CC8F2` |
| status completed / ongoing / planned | green `#1E7A45` / amber `#A86A00` / slate `#5A6472` | `#5BD38D` / `#F2B544` / `#9AA6B5` |

All text/background pairs must pass WCAG AA (check both themes; adjust lightness if any fail).

### 7.3 Type
- Headings: **Sora** 600/700 (`@fontsource/sora`). Body: **IBM Plex Sans** 400/500/600.
  Mono (labels, badges, stats): **JetBrains Mono** 500. Use `font-display: swap`; preload the
  two most-used weights only.
- Scale: clamp-based fluid sizes; body 17–18px; line-height 1.6; max line length ~68ch.

### 7.4 Components
Buttons (primary/ghost), chips, status badge (mono, uppercase, dot + word — never colour alone),
cards with a thin copper "trace" border that lights on hover/focus, timeline nodes as solder pads.
Corner radius 10px; 8px spacing grid. No heavy shadows; use 1px lines.

### 7.5 Motion
- Section reveal: 12px rise + fade, 400ms, once. Counters animate once on view.
- Respect `prefers-reduced-motion`: no reveals, no counters animation, no scene morph or pulses
  (scene shows a still frame of the current layout).
- No custom cursor (it hurts usability). No scroll-jacking.

---

## 8. 3D scene spec

- Renderer: `WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' })`.
  Pixel ratio ≤ 2 desktop, ≤ 1.5 mobile. Canvas fixed behind content, `aria-hidden="true"`.
- Nodes: one `Points` (or `InstancedMesh` of small quads) with N nodes — desktop 900, mobile 420,
  low-power 260. Same N for every layout so positions can interpolate.
- Edges: `LineSegments` per layout (precomputed index pairs). Cross-fade edge sets during morphs.
- Layouts (`layouts.js`, seeded PRNG so they are identical every visit):
  - `board`: nodes snapped to a grid; edges routed as right-angle traces (`traces.js`); 4–6 larger
    "IC" clusters; signal pulses run along traces.
  - `chip`: square IC package outline with pins radiating out on four sides.
  - `detect`: nodes grouped into 5–7 clusters, each wrapped by a rectangle of edges (a nod to
    object-detection bounding boxes).
  - `neural`: feed-forward network — 5 vertical layers; edges between adjacent layers (sparse).
    Each project maps to a fixed subset of hidden-layer nodes; hover/focus on a card highlights its
    subset and the paths through it.
  - `trace`: one long signal trace with a pad per experience item; pulse travels along it on scroll.
  - `rings`: concentric rings, one per skill group; hovering a skill group highlights its ring.
  - `antenna`: nodes gather to a point with expanding ripple rings.
- Morph: GSAP ScrollTrigger scrubbed between consecutive section layouts (ease `power2.inOut`).
- Colours come from tokens via `theme.js` → `scene.setPalette()`. Light theme uses normal blending;
  dark theme uses additive blending + optional bloom (desktop, ≥4 cores only).
- Pointer: subtle parallax (max 3°). Touch: none.
- Pause rendering when the tab is hidden or the canvas is off-screen; cap at 60 fps.
- Failure modes: no WebGL2 / context lost → add `html.no-webgl`; CSS shows a static SVG circuit
  pattern background (`public/img/board.svg`, drawn by you).
- Budget: scene chunk (three + scene code) ≤ 190 KB gzip; total JS ≤ 260 KB gzip.

---

## 9. Quality bars

| Area | Target |
|---|---|
| Lighthouse mobile | Performance ≥ 90, Accessibility 100, Best Practices 100, SEO 100 |
| LCP / CLS / INP | ≤ 2.5 s / ≤ 0.05 / ≤ 200 ms (mobile emulation) |
| Images | AVIF + WebP via `<picture>`, explicit width/height, `loading="lazy"` below the fold |
| Accessibility | Skip link, landmarks, one `h1`, visible focus ring (`--signal`), keyboard-usable filters, panel and gallery; status badges have text; alt text on every image |
| Browsers | Last 2 versions of Chrome, Edge, Firefox, Safari; Android Chrome; iOS Safari |
| No-JS | All content readable, CV downloadable, links work |

CI (`.github/workflows/ci.yml`): on push and PR → `npm ci`, `lint`, `check:data` (`--strict` on
`main` only), `build`, `check:links`, `lhci autorun` with the budgets above.

---

## 10. Build phases

Do one phase per request. Stop after each with a short summary and what to review.

| Phase | Scope | Done when |
|---|---|---|
| 1 Setup | Vite scaffold, folder structure, lint/format/typecheck, jsconfig, `.gitignore`, README skeleton with credits, Vercel-ready config | `npm run dev` serves a blank styled page; `npm run lint` passes |
| 2 Data | `confirm.js`, `types.js`, `profile.js` from section 11, `check-data.js` | `npm run check:data` passes and prints the TO_CONFIRM list |
| 3 Static site | Prerender plugin, all render functions, CSS tokens/components, theme, nav, filters, reveal, copy-email, both themes, responsive | Fully readable with JS off; keyboard-only walkthrough works; Lighthouse a11y 100 |
| 4 Scene | Lazy-loaded Three.js scene with all layouts, morphing, highlights, fallback, reduced motion, pause on hidden | Smooth on a mid-range phone; disabling WebGL leaves a clean static background |
| 5 Case studies + Now building | Drawer with deep links and focus trap; CircuitCoach panel with steps and `demoLive` flag | `#project/circuitcoach-ai` opens directly; Esc closes; focus returns |
| 6 Polish | Original loader (≤ 1.2 s, skipped on repeat visits and reduced motion), lab gallery + lightbox, favicon, `og.png`, static `board.svg` | Owner approves the look |
| 7 SEO + speed | Head tags, JSON-LD, sitemap, image pipeline, budgets met | Lighthouse targets in section 9 met |
| 8 CI + launch | GitHub Actions, Lighthouse CI config, README finished, deploy | A PR with a broken link fails CI; production URL live |

---

## 11. Seed content (source of truth for `profile.js`)

Use this text as-is unless the owner edits it. `TO_CONFIRM` = use the sentinel.

### profile
- name: **Mohamed Jatheel**; initials: MJ
- title: AI Undergraduate · Computer Vision · LLM Applications · Robotics
- roles (rotating words): "computer-vision models", "LLM + RAG assistants", "FastAPI backends",
  "Arduino robotics"
- intro: "Third-year AI undergraduate at the University of Moratuwa. I build computer-vision models,
  LLM-powered tools and the APIs behind them — and I teach beginners to build robots with Arduino."
- about:
  1. "I'm studying for a BSc (Hons) in Artificial Intelligence at the University of Moratuwa's
     Faculty of Information Technology. I like taking an idea all the way from research and
     architecture to a working app with an API and an interface."
  2. "My current focus is computer vision: CircuitCoach AI, a detector that recognises electronic
     components and explains what they do. Alongside that I build LLM applications with retrieval
     and structured outputs, and I teach Arduino robotics at Wisdom Campus."
- focus areas: Large language models · Computer vision · Robotics & embedded systems ·
  Human-centred, privacy-aware AI
- location: `TO_CONFIRM` (options: "Mannar, Sri Lanka" / "Moratuwa, Sri Lanka" / "Sri Lanka")
- availability: "Open to AI/ML, computer vision and robotics internships"
- email: jatheelmhd11@gmail.com
- phone: 076 057 3227; **showPhone: false**
- linkedin: https://linkedin.com/in/jatheelmhd
- github: https://github.com/Jatheel
- photo: `TO_CONFIRM` (fallback: monogram avatar "MJ" on a chip outline)

### cvs
- { label: "CV — AI / ML", file: "/cv/Mohamed_Jatheel_CV_AI-ML.pdf" }
- { label: "CV — Computer Vision", file: "/cv/Mohamed_Jatheel_CV_Computer-Vision.pdf" }
  (If a file is missing at build time, warn and hide that button.)

### nowBuilding — CircuitCoach AI
- status: ongoing; started: Nov 2026
- line: "Point a phone camera at a box of parts and get each component's name and what it does."
- steps (state each `TO_CONFIRM` until owner sets `done | active | todo`):
  1. Dataset audit and leak-free re-split (ElectroCom61)
  2. Train YOLO26n detector
  3. Evaluate: per-class precision/recall, mAP, failure review
  4. Publish model on Hugging Face
  5. Web demo on Hugging Face Spaces
  6. Phone-photo test set (real-world score)
  7. Android app with on-device detection (optional)
- demoLive: false; demoUrl: `TO_CONFIRM`; modelUrl: `TO_CONFIRM`; repoUrl: `TO_CONFIRM`

### projects

**1. CircuitCoach AI** — id `circuitcoach-ai` · status **ongoing** · category `cv` · featured · period "Nov 2026 – present"
- subtitle: Electronic component recognition and learning assistant
- summary: "A computer-vision assistant that detects electronic and robotics components in a photo
  and explains what each one does, built for students learning Arduino and robotics."
- tech: Python, PyTorch, Ultralytics YOLO26n, Hugging Face, Gradio, Kaggle GPU
- caseStudy:
  - problem: "Beginners often have a box of parts they can't name. CircuitCoach answers the first
    question a learner asks — 'what is this part?' — and then explains it."
  - role: "Solo project: dataset preparation, training, evaluation, publishing and demo."
  - approach: "Public ElectroCom61 dataset (2,121 images, 61 classes, CC BY 4.0)"; "Label checks,
    duplicate and near-duplicate removal, then a 75/15/10 re-split by duplicate group so near-identical
    photos never cross the train/test line"; "Fine-tune YOLO26n from pretrained weights on a Kaggle GPU";
    "Short, sourced knowledge cards per component in one JSON file shared by every demo";
    "Web demo on Hugging Face Spaces; optional Flutter Android app for offline detection"
  - testing: omit until measured.
  - limitations: "All training photos come from one lab, so accuracy on other desks will be lower";
    "Recognises components only — it does not check circuits, wiring or electrical safety";
    "No published metrics yet"
  - next: "Phone-photo test set to measure the real-world gap"; "More knowledge cards";
    "Parts checklist for fixed practicals"
- credit line in panel: "Dataset: ElectroCom61, Sayeedi et al., Data in Brief 59 (2025) 111331, CC BY 4.0."

**2. SmartDesk** — id `smartdesk` · status **completed** · category `genai` · featured · period "2026"
- subtitle: AI-assisted productivity and focus assistant for developers
- summary: "Collects developer activity signals, merges them into one timeline and turns focus and
  idle patterns into recommendations and reports."
- tech: Python, FastAPI, `TO_CONFIRM` (any others actually used)
- caseStudy:
  - problem: "Developers lose focus to context switching and long sessions without realising it."
  - role: "Designed and built the system end to end." (`TO_CONFIRM` if team project)
  - approach: "Collectors for keyboard, mouse, active application, window switching and idle events";
    "A merging layer that finalises timestamps and combines all signals into one chronological
    activity stream"; "An IDE extension (`TO_CONFIRM`: VS Code?)"; "A rule-based recommendation
    engine"; "A report generator summarising sessions"; "System design grounded in research on
    productivity and human–computer interaction"
  - limitations: "Recommendations are rule-based heuristics, not a validated measure of focus or
    fatigue"; "Privacy: local-only processing `TO_CONFIRM` — do not claim until data flows are checked"
  - next: "User controls for what is collected"; "Evaluation with real users"
- links: repo `TO_CONFIRM`

**3. AI YAML Specification Assistant** — id `yaml-spec-assistant` · status **completed** · category `genai` · featured · period "2026"
- subtitle: LLM / RAG documentation agent
- summary: "An LLM assistant that answers questions about YAML-defined certification rules by
  combining exact rule lookup with semantic search, returning validated, source-tagged answers."
- tech: Python, LangGraph, LangChain, Groq, sentence-transformers, ChromaDB, FastAPI, Pydantic,
  Docker, pytest, Ruff, GitHub Actions
- links: GitHub https://github.com/Jatheel/ai-yaml-spec-assistant
- caseStudy:
  - problem: "Finding the right alternative documents and conditions in long YAML rule sets is slow
    and error-prone."
  - role: "Designed and built the agent, retrieval tools, API and interface."
  - approach: "LangGraph tool-using agent with a bounded iteration loop"; "Deterministic YAML lookup
    for exact rule keys plus embedding search (all-MiniLM-L6-v2 + ChromaDB) for vague questions";
    "SHA-256 content hash rebuilds the vector index only when YAML changes"; "Pydantic-validated
    responses with retrieved-source metadata"; "FastAPI REST and server-sent-event endpoints, a light
    browser UI, Docker and a CI workflow"
  - testing: "Unit tests for confidence logic, text normalisation and lazy embedding loading."
  - limitations: "Confidence is a heuristic, not a calibrated probability"; "Session memory is
    in-process only"; "Demo configuration: open CORS and no authentication"; "No retrieval benchmark yet"
  - next: "Labelled evaluation set (recall@k, groundedness)"; "API tests"; "Make CI fail on test failures"
- architecture note: user question → FastAPI → LangGraph agent → (YAML lookup | semantic search |
  badge list) → structured answer → browser/SSE.

**4. Secure Cloud File Sharing** — id `secure-file-sharing` · status **completed** · category `fullstack` · period `TO_CONFIRM`
- title: "Secure Cloud File Sharing with Tamper-Evident Audit Log" (use "blockchain" only if the owner
  confirms a real blockchain)
- summary: "A full-stack file-sharing platform with role-based access, expiring share links, instant
  revocation and a SHA-256 hash-linked audit log that makes tampering detectable."
- tech: React, Node.js, Express, MongoDB, JWT, bcrypt, SHA-256
- caseStudy:
  - problem: "Shared files need clear control over who can access them and a record nobody can
    quietly edit."
  - role: `TO_CONFIRM` (solo or team; own contribution)
  - approach: "Hash-linked audit records for every upload, share, download and revocation";
    "Token-based sharing with optional expiry and recipient-only downloads"; "Client-side SHA-256
    check so recipients can confirm a file wasn't altered"; "JWT auth, bcrypt hashing, role-based
    access control and admin approval of new accounts"
  - limitations: "Centralised, hash-linked log — not a decentralised blockchain"
  - next: `TO_CONFIRM`
- links: repo `TO_CONFIRM`

**5. Automated Warehouse Management Bot** — id `warehouse-bot` · status **completed** · category `automation` · period `TO_CONFIRM`
- summary: "A Python tool that keeps inventory and stock records up to date with rule-based
  automation and input validation that catches bad entries before they are saved."
- tech: Python
- caseStudy: problem "Manual stock records are slow and error-prone." · role `TO_CONFIRM` ·
  approach: "Rule-based workflows for inventory tracking and stock updates"; "Validation on every
  entry" · limitations: "Rule-based; no forecasting" · next `TO_CONFIRM`
- Do **not** merge with the university warehouse robot unless the owner confirms they are one project.
- links: repo `TO_CONFIRM`

### upNext (planned; hidden unless `site.showUpNext`)
- FraudSense AI — transaction fraud detection with PR-AUC-focused evaluation (planned)
- VisionInspect AI — PCB defect localisation (planned)
- AutoNav Warehouse Rover — ROS 2 navigation in simulation (planned)

### experience (newest first)
1. **Robotics Tutor** — Wisdom Campus, Beruwala · Oct 2026 – present · part-time
   - "Teach Arduino-based robotics projects to beginners, from wiring sensors and motors to writing
     the code that drives them."
2. **IT Tutor** — MDC Organization · 2025 – present (`TO_CONFIRM` start month and current status)
   - "Teach foundational IT concepts and plan structured practical sessions, explaining technical
     topics in simple, step-by-step language."
3. **Mathematics & Physics Tutor** — Self-employed · 2023 – 2024
   - "Ran one-to-one tutoring, prepared material for each student and adapted explanations to how
     they learned."

### leadership
- **Chairperson, Tech Bytes — Rotaract** (`TO_CONFIRM` club name, dates): "Led a weekly technology
  session series: chose topics, coordinated speakers and ran each session."
- **University of Moratuwa Mannar Students' Association**: "Organised events — planning, logistics
  and volunteer coordination."

### skills (level `used` unless marked *exposure*)
- Languages: Python, JavaScript, Java, C
- AI & ML: Machine-learning fundamentals, Model training & evaluation, LLM applications (LangGraph,
  LangChain), RAG & embeddings, NLP concepts, Object detection — Ultralytics YOLO (*exposure*, in progress)
- Backend: FastAPI, Pydantic, Node.js, Express, REST APIs, Server-sent events
- Frontend: React, Vite, Tailwind CSS, HTML/CSS/JavaScript
- Data: MongoDB Atlas, Mongoose, ChromaDB (*exposure*)
- Tools: Git & GitHub, Postman, cURL, Docker (*exposure*), pytest (*exposure*), Ruff (*exposure*),
  GitHub Actions (*exposure*)
- Hardware: Arduino Uno, Ultrasonic/IR/LDR sensors, Servo & DC motors, Motor drivers, LCD &
  7-segment displays, Serial communication with Processing
- Never list: ROS 2, Gazebo, Nav2, SLAM, PostgreSQL, SQLite (until built and confirmed).

### lab (Arduino gallery; images `TO_CONFIRM`, hide items without an image)
Servo control · Ultrasonic distance meter · IR line follower · LDR night lamp · 7-segment & LCD
display · Keypad password locker · Railway gate · Radar with Processing

### education
- BSc (Hons) in Artificial Intelligence — Faculty of Information Technology, University of Moratuwa ·
  third year (as of Nov 2026) · expected graduation `TO_CONFIRM`
- G.C.E. Advanced Level — Physical Science: Combined Mathematics B, Chemistry B, Physics B ·
  school/year `TO_CONFIRM` (hide if unconfirmed)
- G.C.E. Ordinary Level — 9 A passes

### site
- url: `TO_CONFIRM` (e.g. https://jatheel.vercel.app or a custom domain)
- showUpNext: false
- meta description: "Mohamed Jatheel — AI undergraduate at the University of Moratuwa building
  computer-vision models, LLM applications and Arduino robotics projects."
- footer: "© {year} Mohamed Jatheel · Built with Vite and Three.js"

### derived hero stats (computed, never typed)
- completed projects = `projects.filter(p => p.status === 'completed').length`
- years teaching = current year − 2023
- component classes CircuitCoach is learning = 61 (label: "component classes in training data")

---

## 12. Conventions

- Files ≤ 250 lines; split otherwise. Pure functions in `render/`; DOM code only in `ui/` and `scene/`.
- Names: kebab-case files, camelCase functions, `data-*` hooks for JS (never style classes as hooks).
- CSS: BEM-ish class names, custom properties for every colour and spacing value; mobile-first;
  `@media (prefers-reduced-motion: reduce)` blocks next to the motion they disable.
- Comments explain *why*, not *what*. No dead code, no `console.log` in commits.
- Commits: Conventional Commits (`feat:`, `fix:`, `content:`, `chore:`). Content-only changes use `content:`.

## 13. Content updates later
Change content only in `src/data/profile.js`, then run `npm run check:data && npm run build`.
When CircuitCoach reaches a milestone: update `nowBuilding.steps`, then set `demoLive: true` and the
URLs when the Space is public. Add `metrics` only with `measuredOn` (test set + date).
