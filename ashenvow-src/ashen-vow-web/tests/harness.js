// 共享测试 harness：把 tables/engine/storage/presentation/ui 五个源码按
// build-standalone.js 的相同方式 strip 掉 import/export 后，在 vm 里加载，
// 返回 {ctx, root}。供 ui-contract / ui-smoke 等 UI 测试复用。
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const strip = s => s
  .replace(/^import [\s\S]*?from ['"][^'"]+['"];\s*$/gm, '')
  .replace(/^export \{[\s\S]*?\};\s*$/gm, '')
  .replace(/\bexport (?=(?:const|let|function|class|async))/g, '');

export function readSources() {
  const tables = strip(fs.readFileSync(path.join(base, 'src/data/tables.js'), 'utf8'));
  const engine = strip(fs.readFileSync(path.join(base, 'src/engine.js'), 'utf8'));
  const storage = strip(fs.readFileSync(path.join(base, 'src/storage.js'), 'utf8'));
  const presentation = strip(fs.readFileSync(path.join(base, 'src/presentation.js'), 'utf8'));
  const ui = fs.readFileSync(path.join(base, 'src/ui.js'), 'utf8').replace(/^import .*?;\s*\n/gm, '');
  return { tables, engine, storage, presentation, ui };
}

export function loadUI() {
  const root = { innerHTML: '', addEventListener() {} };
  const generic = { classList: { add() {}, remove() {}, toggle() {} }, addEventListener() {}, click() {}, value: '' };
  const document = { getElementById: id => id === 'app' ? root : generic, querySelector: () => generic, documentElement: {} };
  const ctx = vm.createContext({
    console, document,
    window: { addEventListener() {}, matchMedia() { return { matches: false }; } },
    globalThis: null,
    localStorage: { getItem() { return null; }, setItem() {} },
    indexedDB: undefined,
    Date, Promise, Math, JSON, structuredClone, Blob, URL, setTimeout() {},
  });
  ctx.globalThis = ctx;
  const { tables, engine, storage, presentation, ui } = readSources();
  vm.runInContext(`${tables}\n${engine}\n${storage}\n${presentation}\n${ui}`, ctx);
  return { ctx, root };
}

// 把 65 个 data-action 冻结表集中定义在此，作为唯一的契约真相源。
export const FROZEN_ACTIONS = [
  // 导航/外壳
  'nav-menu', 'nav-game', 'nav-saves', 'nav-settings', 'nav-guide', 'nav-codex', 'codex-tab', 'tutorial-done',
  // 存档
  'new', 'load', 'delete', 'export', 'import', 'restore',
  // 设置
  'setting-sound', 'setting-music', 'setting-motion', 'setting-text', 'setting-log', 'pace', 'fullscreen',
  // 营地
  'building', 'plan', 'region', 'difficulty', 'train-skill', 'skill-branch', 'treat-trait', 'pray',
  'talent-hero', 'talent', 'camp-tab', 'camp-section', 'quick-heal', 'hero-focus', 'active-choice',
  'equip-hero', 'recruit', 'swap-hero', 'dismiss', 'equip', 'unequip', 'salvage', 'heal', 'upgrade',
  'forge', 'move', 'buy', 'expedition',
  // 地图
  'node', 'enter-node', 'use-potion', 'use-sigil',
  // 事件
  'choice',
  // 战斗/结算
  'retreat', 'camp', 'skip', 'full-log', 'close-log', 'copy-log', 'end-turn', 'basic-attack', 'skill', 'unit', 'bandage',
];

// 从一段渲染出的 HTML 中提取所有 data-action 值（去重、排序）。
export function extractActions(html) {
  const set = new Set();
  const re = /data-action="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return [...set].sort();
}

// 从 ui.js 源码的 actionRun 分发分支里提取所有 action 名（a==='xxx'）。
// 这是 data-action 契约的真相源：actionRun 里处理过的 action 才是真正生效的。
export function extractActionsFromSource(uiSource) {
  const set = new Set();
  const re = /a==='([a-z-]+)'/g;
  let m;
  while ((m = re.exec(uiSource)) !== null) set.add(m[1]);
  return [...set].sort();
}
