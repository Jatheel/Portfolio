// @ts-check
/** Enhancement entry. The page is complete without this; everything here is progressive. */
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/dialogs.css';
import './styles/sections.css';
import './styles/now.css';
import './styles/projects.css';
import './styles/case-study.css';
import './styles/sections-2.css';
import './styles/motion.css';

import { initBoot } from './ui/boot.js';
import { initTheme } from './ui/theme.js';
import { initNav } from './ui/nav.js';
import { initFilters } from './ui/filters.js';
import { initPanel } from './ui/panel.js';
import { initCopyEmail } from './ui/copyEmail.js';
import { initReveal } from './ui/reveal.js';
import { initCounters } from './ui/counters.js';
import { initRotator } from './ui/rotator.js';
import { initLightbox } from './ui/lightbox.js';
import { initScene } from './ui/sceneLoader.js';

initBoot();
initTheme();
initNav();
initFilters();
initPanel();
initCopyEmail();
initReveal();
initCounters();
initRotator();
initLightbox();
initScene();
