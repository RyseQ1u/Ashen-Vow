/**
 * Ashen Vow — core type contracts (JSDoc). Runtime-free reference module.
 * Phase 0: documents the schemaVersion 1 save shape consumed by isValidSave.
 */

/**
 * @typedef {Object} Hero
 * @property {string} id
 * @property {string} classId - key of CLASSES
 * @property {string} name
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} stress
 * @property {number} level - 1..5
 * @property {number} [xp] - display progress within level
 * @property {string[]} [traits] - TRAITS ids
 * @property {Record<string,number>} [skillLevels]
 * @property {Record<string,string>} [skillBranches]
 * @property {Record<string,number>} [talents]
 * @property {number} [talentPoints]
 * @property {string|null} [crisis]
 * @property {(string|null)[]} [trinkets]
 * @property {number} [rank]
 * @property {number} [weaponLevel]
 * @property {number} [armorLevel]
 */

/**
 * @typedef {Object} BattleUnit
 * @property {string} id
 * @property {string} name
 * @property {string} type - enemy type key or hero classId
 * @property {number} rank
 * @property {number} hp
 * @property {number} maxHp
 * @property {number} attack
 * @property {number} speed
 * @property {number} armor
 * @property {number} stress
 * @property {Record<string,number>} statuses
 * @property {'hero'|'enemy'} side
 */

/**
 * @typedef {Object} GameState
 * @property {number} schemaVersion - always 1
 * @property {'camp'|'map'|'battle'|'event'|'result'} phase
 * @property {number} gold
 * @property {number} shards
 * @property {number} day
 * @property {number} expeditions
 * @property {number} rngState - uint32
 * @property {{torches:number,bandages:number, [k:string]:number}} supplies
 * @property {Hero[]} heroes
 * @property {Hero[]} [reserveHeroes]
 * @property {string[]} history
 * @property {Object|null} [battle]
 * @property {Object|null} [expedition]
 * @property {Object|null} [event]
 * @property {Object|null} [result]
 */

/**
 * Skill category used by Phase 1 skill cards.
 * @typedef {'damage'|'defense'|'buff'|'finisher'} SkillCategory
 */

export {};
