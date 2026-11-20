// @ts-check
/**
 * Single source of truth for every word on the site (CLAUDE.md §11).
 * Content-only file: it is allowed to exceed the 250-line convention so all facts stay in one place.
 * Unknown facts use TO_CONFIRM; the UI hides them and `npm run check:data` lists them.
 */
import { TO_CONFIRM } from './confirm.js';

/** @typedef {import('./types.js').Project} Project */

export const profile = {
  name: 'Mohamed Jatheel',
  initials: 'MJ',
  title: 'AI Undergraduate · Computer Vision · LLM Applications · Robotics',
  roles: ['computer-vision models', 'LLM + RAG assistants', 'FastAPI backends', 'Arduino robotics'],
  intro:
    'Third-year AI undergraduate at the University of Moratuwa. I build computer-vision models, LLM-powered tools and the APIs behind them — and I teach beginners to build robots with Arduino.',
  about: [
    "I'm studying for a BSc (Hons) in Artificial Intelligence at the University of Moratuwa's Faculty of Information Technology. I like taking an idea all the way from research and architecture to a working app with an API and an interface.",
    'My current focus is computer vision: CircuitCoach AI, a detector that recognises electronic components and explains what they do. Alongside that I build LLM applications with retrieval and structured outputs, and I teach Arduino robotics at Wisdom Campus.',
  ],
  focusAreas: [
    'Large language models',
    'Computer vision',
    'Robotics & embedded systems',
    'Human-centred, privacy-aware AI',
  ],
  // Options: "Mannar, Sri Lanka" / "Moratuwa, Sri Lanka" / "Sri Lanka"
  location: TO_CONFIRM,
  availability: 'Open to AI/ML, computer vision and robotics internships',
  email: 'jatheelmhd11@gmail.com',
  phone: '076 057 3227',
  showPhone: false,
  linkedin: 'https://linkedin.com/in/jatheelmhd',
  github: 'https://github.com/Jatheel',
  // Image id in public/img/; until then a monogram avatar is drawn.
  photo: TO_CONFIRM,
  teachingSince: 2023,
};

/** @type {import('./types.js').Cv[]} */
export const cvs = [
  { label: 'CV — AI / ML', file: '/cv/Mohamed_Jatheel_CV_AI-ML.pdf', audience: 'AI / ML' },
  {
    label: 'CV — Computer Vision',
    file: '/cv/Mohamed_Jatheel_CV_Computer-Vision.pdf',
    audience: 'Computer Vision',
  },
];

export const nowBuilding = {
  projectId: 'circuitcoach-ai',
  title: 'CircuitCoach AI',
  status: /** @type {const} */ ('ongoing'),
  started: 'Nov 2026',
  line: "Point a phone camera at a box of parts and get each component's name and what it does.",
  dataset: { name: 'ElectroCom61', images: 2121, classes: 61, licence: 'CC BY 4.0' },
  /** @type {import('./types.js').Step[]} */
  steps: [
    { label: 'Dataset audit and leak-free re-split (ElectroCom61)', state: TO_CONFIRM },
    { label: 'Train YOLO26n detector', state: TO_CONFIRM },
    { label: 'Evaluate: per-class precision/recall, mAP, failure review', state: TO_CONFIRM },
    { label: 'Publish model on Hugging Face', state: TO_CONFIRM },
    { label: 'Web demo on Hugging Face Spaces', state: TO_CONFIRM },
    { label: 'Phone-photo test set (real-world score)', state: TO_CONFIRM },
    { label: 'Android app with on-device detection', state: TO_CONFIRM, optional: true },
  ],
  demoLive: false,
  demoUrl: TO_CONFIRM,
  modelUrl: TO_CONFIRM,
  repoUrl: TO_CONFIRM,
};

/** @type {Project[]} */
export const projects = [
  {
    id: 'circuitcoach-ai',
    title: 'CircuitCoach AI',
    subtitle: 'Electronic component recognition and learning assistant',
    status: 'ongoing',
    category: 'cv',
    featured: true,
    period: 'Nov 2026 – present',
    summary:
      'A computer-vision assistant that detects electronic and robotics components in a photo and explains what each one does, built for students learning Arduino and robotics.',
    tech: ['Python', 'PyTorch', 'Ultralytics YOLO26n', 'Hugging Face', 'Gradio', 'Kaggle GPU'],
    links: [],
    caseStudy: {
      problem:
        "Beginners often have a box of parts they can't name. CircuitCoach answers the first question a learner asks — 'what is this part?' — and then explains it.",
      role: 'Solo project: dataset preparation, training, evaluation, publishing and demo.',
      approach: [
        'Public ElectroCom61 dataset (2,121 images, 61 classes, CC BY 4.0)',
        'Label checks, duplicate and near-duplicate removal, then a 75/15/10 re-split by duplicate group so near-identical photos never cross the train/test line',
        'Fine-tune YOLO26n from pretrained weights on a Kaggle GPU',
        'Short, sourced knowledge cards per component in one JSON file shared by every demo',
        'Web demo on Hugging Face Spaces; optional Flutter Android app for offline detection',
      ],
      limitations: [
        'All training photos come from one lab, so accuracy on other desks will be lower',
        'Recognises components only — it does not check circuits, wiring or electrical safety',
        'No published metrics yet',
      ],
      next: [
        'Phone-photo test set to measure the real-world gap',
        'More knowledge cards',
        'Parts checklist for fixed practicals',
      ],
      credit: 'Dataset: ElectroCom61, Sayeedi et al., Data in Brief 59 (2025) 111331, CC BY 4.0.',
    },
  },
  {
    id: 'smartdesk',
    title: 'SmartDesk',
    subtitle: 'AI-assisted productivity and focus assistant for developers',
    status: 'completed',
    category: 'genai',
    featured: true,
    period: '2026',
    summary:
      'Collects developer activity signals, merges them into one timeline and turns focus and idle patterns into recommendations and reports.',
    // Any other technologies actually used are still to be confirmed.
    tech: ['Python', 'FastAPI', TO_CONFIRM],
    links: [{ label: 'Source on GitHub', url: TO_CONFIRM }],
    open: { team: TO_CONFIRM, ide: TO_CONFIRM, localOnlyProcessing: TO_CONFIRM },
    caseStudy: {
      problem: 'Developers lose focus to context switching and long sessions without realising it.',
      role: 'Designed and built the system end to end.',
      approach: [
        'Collectors for keyboard, mouse, active application, window switching and idle events',
        'A merging layer that finalises timestamps and combines all signals into one chronological activity stream',
        'An IDE extension',
        'A rule-based recommendation engine',
        'A report generator summarising sessions',
        'System design grounded in research on productivity and human–computer interaction',
      ],
      limitations: [
        'Recommendations are rule-based heuristics, not a validated measure of focus or fatigue',
      ],
      next: ['User controls for what is collected', 'Evaluation with real users'],
    },
  },
  {
    id: 'yaml-spec-assistant',
    title: 'AI YAML Specification Assistant',
    subtitle: 'LLM / RAG documentation agent',
    status: 'completed',
    category: 'genai',
    featured: true,
    period: '2026',
    summary:
      'An LLM assistant that answers questions about YAML-defined certification rules by combining exact rule lookup with semantic search, returning validated, source-tagged answers.',
    tech: [
      'Python',
      'LangGraph',
      'LangChain',
      'Groq',
      'sentence-transformers',
      'ChromaDB',
      'FastAPI',
      'Pydantic',
      'Docker',
      'pytest',
      'Ruff',
      'GitHub Actions',
    ],
    links: [
      { label: 'Source on GitHub', url: 'https://github.com/Jatheel/ai-yaml-spec-assistant' },
    ],
    caseStudy: {
      problem:
        'Finding the right alternative documents and conditions in long YAML rule sets is slow and error-prone.',
      role: 'Designed and built the agent, retrieval tools, API and interface.',
      approach: [
        'LangGraph tool-using agent with a bounded iteration loop',
        'Deterministic YAML lookup for exact rule keys plus embedding search (all-MiniLM-L6-v2 + ChromaDB) for vague questions',
        'SHA-256 content hash rebuilds the vector index only when YAML changes',
        'Pydantic-validated responses with retrieved-source metadata',
        'FastAPI REST and server-sent-event endpoints, a light browser UI, Docker and a CI workflow',
      ],
      architecture:
        'A question goes to the FastAPI service, which hands it to a LangGraph agent. The agent picks a tool — exact YAML lookup, semantic search or the badge list — and returns a structured answer to the browser, streamed over server-sent events.',
      architectureFlow: [
        'User question',
        'FastAPI',
        'LangGraph agent',
        'YAML lookup · semantic search · badge list',
        'Structured answer',
        'Browser / SSE',
      ],
      testing: 'Unit tests for confidence logic, text normalisation and lazy embedding loading.',
      limitations: [
        'Confidence is a heuristic, not a calibrated probability',
        'Session memory is in-process only',
        'Demo configuration: open CORS and no authentication',
        'No retrieval benchmark yet',
      ],
      next: [
        'Labelled evaluation set (recall@k, groundedness)',
        'API tests',
        'Make CI fail on test failures',
      ],
    },
  },
  {
    id: 'secure-file-sharing',
    title: 'Secure Cloud File Sharing with Tamper-Evident Audit Log',
    subtitle: 'Full-stack file sharing with access control and a hash-linked audit log',
    status: 'completed',
    category: 'fullstack',
    period: TO_CONFIRM,
    summary:
      'A full-stack file-sharing platform with role-based access, expiring share links, instant revocation and a SHA-256 hash-linked audit log that makes tampering detectable.',
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'bcrypt', 'SHA-256'],
    links: [{ label: 'Source on GitHub', url: TO_CONFIRM }],
    // "Secure" in the title is the project's name; the repo link is its evidence.
    evidence: [{ claim: 'secure', url: TO_CONFIRM }],
    caseStudy: {
      problem:
        'Shared files need clear control over who can access them and a record nobody can quietly edit.',
      role: TO_CONFIRM,
      approach: [
        'Hash-linked audit records for every upload, share, download and revocation',
        'Token-based sharing with optional expiry and recipient-only downloads',
        "Client-side SHA-256 check so recipients can confirm a file wasn't altered",
        'JWT auth, bcrypt hashing, role-based access control and admin approval of new accounts',
      ],
      limitations: ['Centralised, hash-linked log — not a decentralised blockchain'],
      next: [TO_CONFIRM],
    },
  },
  {
    id: 'warehouse-bot',
    title: 'Automated Warehouse Management Bot',
    subtitle: 'Rule-based inventory automation in Python',
    status: 'completed',
    category: 'automation',
    period: TO_CONFIRM,
    summary:
      'A Python tool that keeps inventory and stock records up to date with rule-based automation and input validation that catches bad entries before they are saved.',
    tech: ['Python'],
    links: [{ label: 'Source on GitHub', url: TO_CONFIRM }],
    // Separate from the university warehouse robot unless the owner confirms otherwise.
    caseStudy: {
      problem: 'Manual stock records are slow and error-prone.',
      role: TO_CONFIRM,
      approach: [
        'Rule-based workflows for inventory tracking and stock updates',
        'Validation on every entry',
      ],
      limitations: ['Rule-based; no forecasting'],
      next: [TO_CONFIRM],
    },
  },
];

/** Planned ideas — rendered only when site.showUpNext is true. */
export const upNext = [
  { title: 'FraudSense AI', line: 'Transaction fraud detection with PR-AUC-focused evaluation' },
  { title: 'VisionInspect AI', line: 'PCB defect localisation' },
  { title: 'AutoNav Warehouse Rover', line: 'ROS 2 navigation in simulation' },
];

/** @type {import('./types.js').Role[]} newest first */
export const experience = [
  {
    title: 'Robotics Tutor',
    org: 'Wisdom Campus',
    place: 'Beruwala',
    period: 'Oct 2026 – present',
    type: 'Part-time',
    description:
      'Teach Arduino-based robotics projects to beginners, from wiring sensors and motors to writing the code that drives them.',
  },
  {
    title: 'IT Tutor',
    org: 'MDC Organization',
    period: '2025 – present',
    open: { startMonth: TO_CONFIRM, stillCurrent: TO_CONFIRM },
    description:
      'Teach foundational IT concepts and plan structured practical sessions, explaining technical topics in simple, step-by-step language.',
  },
  {
    title: 'Mathematics & Physics Tutor',
    org: 'Self-employed',
    period: '2023 – 2024',
    description:
      'Ran one-to-one tutoring, prepared material for each student and adapted explanations to how they learned.',
  },
];

/** @type {import('./types.js').Role[]} */
export const leadership = [
  {
    title: 'Chairperson, Tech Bytes',
    org: 'Rotaract',
    place: TO_CONFIRM,
    period: TO_CONFIRM,
    open: { clubName: TO_CONFIRM, officialTitle: TO_CONFIRM },
    description:
      'Led a weekly technology session series: chose topics, coordinated speakers and ran each session.',
  },
  {
    title: "University of Moratuwa Mannar Students' Association",
    period: TO_CONFIRM,
    description: 'Organised events — planning, logistics and volunteer coordination.',
  },
];

/** @type {import('./types.js').SkillGroup[]} */
export const skills = [
  {
    name: 'Languages',
    skills: ['Python', 'JavaScript', 'Java', 'C'].map((name) => used(name)),
  },
  {
    name: 'AI & ML',
    skills: [
      used('Machine-learning fundamentals'),
      used('Model training & evaluation'),
      used('LLM applications (LangGraph, LangChain)'),
      used('RAG & embeddings'),
      used('NLP concepts'),
      { name: 'Object detection — Ultralytics YOLO', level: 'exposure', note: 'in progress' },
    ],
  },
  {
    name: 'Backend',
    skills: ['FastAPI', 'Pydantic', 'Node.js', 'Express', 'REST APIs', 'Server-sent events'].map(
      (name) => used(name),
    ),
  },
  {
    name: 'Frontend',
    skills: ['React', 'Vite', 'Tailwind CSS', 'HTML/CSS/JavaScript'].map((name) => used(name)),
  },
  {
    name: 'Data',
    skills: [used('MongoDB Atlas'), used('Mongoose'), exposure('ChromaDB')],
  },
  {
    name: 'Tools',
    skills: [
      used('Git & GitHub'),
      used('Postman'),
      used('cURL'),
      exposure('Docker'),
      exposure('pytest'),
      exposure('Ruff'),
      exposure('GitHub Actions'),
    ],
  },
  {
    name: 'Hardware',
    skills: [
      'Arduino Uno',
      'Ultrasonic/IR/LDR sensors',
      'Servo & DC motors',
      'Motor drivers',
      'LCD & 7-segment displays',
      'Serial communication with Processing',
    ].map((name) => used(name)),
  },
];

/** Arduino practicals. Items without a confirmed image are hidden from the gallery. */
/** @type {import('./types.js').LabItem[]} */
export const lab = [
  { slug: 'servo-control', title: 'Servo control', image: TO_CONFIRM },
  { slug: 'ultrasonic-distance', title: 'Ultrasonic distance meter', image: TO_CONFIRM },
  { slug: 'ir-line-follower', title: 'IR line follower', image: TO_CONFIRM },
  { slug: 'ldr-night-lamp', title: 'LDR night lamp', image: TO_CONFIRM },
  { slug: 'segment-lcd-display', title: '7-segment & LCD display', image: TO_CONFIRM },
  { slug: 'keypad-locker', title: 'Keypad password locker', image: TO_CONFIRM },
  { slug: 'railway-gate', title: 'Railway gate', image: TO_CONFIRM },
  { slug: 'processing-radar', title: 'Radar with Processing', image: TO_CONFIRM },
];

/** @type {import('./types.js').Education[]} */
export const education = [
  {
    title: 'BSc (Hons) in Artificial Intelligence',
    institution: 'Faculty of Information Technology, University of Moratuwa',
    detail: 'Third year (as of Nov 2026)',
    expectedGraduation: TO_CONFIRM,
  },
  {
    title: 'G.C.E. Advanced Level — Physical Science',
    detail: 'Combined Mathematics B, Chemistry B, Physics B',
    school: TO_CONFIRM,
    year: TO_CONFIRM,
  },
  { title: 'G.C.E. Ordinary Level', detail: '9 A passes' },
];

export const site = {
  // e.g. https://jatheel.vercel.app or a custom domain
  url: TO_CONFIRM,
  showUpNext: false,
  lang: 'en',
  description:
    'Mohamed Jatheel — AI undergraduate at the University of Moratuwa building computer-vision models, LLM applications and Arduino robotics projects.',
  footer: '© {year} Mohamed Jatheel · Built with Vite and Three.js',
};

/** @param {string} name @returns {import('./types.js').Skill} */
function used(name) {
  return { name, level: 'used' };
}

/** @param {string} name @returns {import('./types.js').Skill} */
function exposure(name) {
  return { name, level: 'exposure' };
}
