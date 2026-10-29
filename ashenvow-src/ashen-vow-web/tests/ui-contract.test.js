// UI 契约测试：锁死重写 UI 时不可破坏的四条契约。
// 1) data-action 冻结表（65 个，多/少即 fail）
// 2) 每次 UI 状态变更后 isValidSave(game) 仍为 true（防 UI 状态污染 game）
// 3) 引擎/表现层关键函数存在（防误删引擎依赖）
// 4) 不朽标识存在（build 哨兵 + standalone.test 依赖）
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import { loadUI, FROZEN_ACTIONS, extractActionsFromSource, readSources } from './harness.js';

function run(ctx, code) {
  return vm.runInContext(code, ctx);
}

test('data-action 契约：actionRun 的 65 个分支与冻结表完全一致', async () => {
  // 真相源是 ui.js 源码里 actionRun 的 a==='xxx' 分发分支，
  // 而不是渲染穷举（条件渲染的 action 无法穷举触发）。
  const uiSource = readSources().ui;
  const actual = extractActionsFromSource(uiSource);
  const frozen = [...FROZEN_ACTIONS].sort();

  const missing = frozen.filter(a => !actual.includes(a));
  const extra = actual.filter(a => !frozen.includes(a));

  assert.deepEqual(missing, [], '缺失的 data-action 分支（被删或改名）');
  assert.deepEqual(extra, [], '多余的 data-action 分支（新增了未登记的 action）');
});

test('存档纯净契约：各屏代表动作后 isValidSave(game) 仍为 true', async () => {
  const { ctx } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));

  const checks = [
    "game=freshGame(31337);view='game'",
    "healAtCamp(game,game.heroes[0].id)",
    "upgradeBuilding(game,'infirmary')",
    "beginExpedition(game)",
    "enterNode(game,reachableNodes(game)[0].id)",
    // 战斗阶段做一次普攻 + 结束回合，覆盖战斗时序路径
    "if(game.battle){const a=currentActor(game);if(a&&a.side==='hero'){basicAttack(game,game.battle.enemies.find(e=>e.hp>0).id);}}",
    "if(game.battle){endTurn(game);}",
  ];

  for (const code of checks) {
    run(ctx, code);
    await Promise.resolve();
    const valid = run(ctx, 'isValidSave(game)');
    assert.equal(valid, true, `执行「${code}」后 isValidSave(game) 为 false（UI 状态可能污染了 game）`);
  }
});

test('引擎/表现层关键函数存在', async () => {
  const { ctx } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));
  const names = [
    'forgeGear', 'chooseSkillBranch', 'trinketName', 'hireRecruit',
    'TRINKET_SETS', 'V08_ROOMS', 'battleTelemetry',
    'basicAttack', 'endTurn', 'performSkill', 'isValidSave', 'ensureProgression',
  ];
  for (const n of names) {
    assert.equal(run(ctx, `typeof ${n} !== 'undefined'`), true, `引擎/表现层导出 ${n} 缺失`);
  }
});

test('不朽标识存在（build 哨兵 + standalone.test 依赖）', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));

  assert.equal(run(ctx, "typeof battlePage === 'function'"), true, 'battlePage 函数缺失（build 哨兵会失败）');

  run(ctx, "game=freshGame(111);view='game';beginExpedition(game);enterNode(game,reachableNodes(game)[0].id);render()");
  for (const id of ['combat-inspector', 'enemy-intents', 'combat-action-report']) {
    assert.match(root.innerHTML, new RegExp(id), `不朽标识 ${id} 缺失`);
  }

  // journal 检查需要 camp phase，重新开局（不进入战斗）
  run(ctx, "game=freshGame(222);view='game';campSection='archive';campTab='journal';render()");
  assert.match(root.innerHTML, /journal-page/, '不朽标识 journal-page 缺失');

  run(ctx, "view='settings';render()");
  assert.match(root.innerHTML, /战斗表现节奏/, '不朽标识「战斗表现节奏」缺失');
});
