// @ts-check
/**
 * JSDoc types for src/data/profile.js. `Confirmable` fields may hold the TO_CONFIRM symbol.
 * @typedef {string | symbol} Confirmable
 * @typedef {'completed'|'ongoing'|'planned'} Status
 * @typedef {'cv'|'genai'|'fullstack'|'automation'|'hardware'} Category
 * @typedef {{ label: string, url: Confirmable }} Link
 * @typedef {{ claim: string, url: Confirmable }} Evidence
 */

/**
 * @typedef {Object} CaseStudy
 * @property {string} problem
 * @property {Confirmable} role          what Jatheel personally did
 * @property {string[]} approach         3–6 bullets
 * @property {string} [architecture]     one paragraph
 * @property {string[]} [architectureFlow] optional left-to-right flow of components
 * @property {string} [testing]          how it was tested/evaluated; omitted if not done
 * @property {string[]} limitations      honest limits — at least 1
 * @property {Array<Confirmable>} next   next steps
 * @property {string} [credit]           dataset or third-party credit line
 */

/**
 * @typedef {Object} Project
 * @property {string} id                 kebab-case, used in #project/<id>
 * @property {string} title
 * @property {string} subtitle
 * @property {Status} status
 * @property {Category} category
 * @property {boolean} [featured]
 * @property {Confirmable} period
 * @property {string} summary
 * @property {Array<Confirmable>} tech
 * @property {Link[]} links
 * @property {CaseStudy} [caseStudy]
 * @property {{ name: string, value: string, measuredOn: string }[]} [metrics]
 * @property {string} [cover]            image id in public/img/projects
 * @property {Evidence[]} [evidence]     links that back a strong word used in this project
 * @property {Record<string, Confirmable>} [open] open questions, shown only once confirmed
 */

/** @typedef {{ name: string, level: 'used'|'exposure', note?: string }} Skill */
/** @typedef {{ name: string, skills: Skill[] }} SkillGroup */

/**
 * @typedef {Object} Step
 * @property {string} label
 * @property {'done'|'active'|'todo'|symbol} state
 * @property {boolean} [optional]
 */

/**
 * @typedef {Object} Role
 * @property {string} title
 * @property {string} [org]
 * @property {Confirmable} [place]
 * @property {Confirmable} period
 * @property {string} [type]
 * @property {string} description
 * @property {Record<string, Confirmable>} [open]
 */

/** @typedef {{ slug: string, title: string, image: Confirmable }} LabItem */

/**
 * @typedef {Object} Education
 * @property {string} title
 * @property {string} [institution]
 * @property {Confirmable} [detail]
 * @property {Confirmable} [school]
 * @property {Confirmable} [year]
 * @property {Confirmable} [expectedGraduation]
 */

/** @typedef {{ label: string, file: string, audience: string }} Cv */

export {};
