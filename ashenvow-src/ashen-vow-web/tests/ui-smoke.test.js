// 冒烟测试（Phase 10 重写）
// 目标只有两件事：
//   1) 每一屏都能 render 出来且不抛异常、不产出 undefined/NaN/[object Object] 之类的脏文案；
//   2) 每屏渲染出的 data-action 全部落在 FROZEN_ACTIONS 契约表内，且关键屏仍有该有的入口。
// 不再断言具体 class 名或文案细节 —— 那些属于设计自由度，不是契约。
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { loadUI, extractActions, FROZEN_ACTIONS } from './harness.js';

const frozen = new Set(FROZEN_ACTIONS);
const run = (ctx, code) => vm.runInContext(code, ctx);

// 一屏 = 一段设置状态的代码 + 该屏至少要有的 action
const SCREENS = [
  { name: '主菜单', code: "view='landing';render()", actions: ['new'] },
  // 无存档时指南只能引导去建存档；有了游戏才有「明白了」入口
  { name: '指南（无存档）', code: "view='guide';render()", actions: ['nav-saves'] },
  { name: '设置', code: "view='settings';render()", actions: ['setting-sound', 'setting-music', 'pace'] },
  { name: '图鉴', code: "view='codex';render()", actions: ['codex-tab'] },
  { name: '存档', code: "view='saves';render()", actions: ['new', 'import'] },
  { name: '指南（有存档）', code: "game=freshGame(4242);view='guide';render()", actions: ['tutorial-done'] },
  { name: '营地·总览', code: "game=freshGame(4242);view='game';campSection='camp';render()", actions: ['camp-section', 'expedition'] },
  { name: '营地·小队', code: "campSection='heroes';campTab='team';render()", actions: ['move', 'heal', 'forge', 'camp-tab'] },
  { name: '营地·招募', code: "campTab='roster';render()", actions: ['recruit'] },
  { name: '营地·饰品', code: "campTab='trinkets';render()", actions: ['camp-tab'] },
  { name: '营地·天赋', code: "campTab='talents';render()", actions: ['talent-hero', 'talent'] },
  { name: '营地·技能', code: "campTab='skills';render()", actions: ['train-skill', 'skill-branch'] },
  { name: '营地·编年史', code: "campSection='archive';campTab='journal';render()", actions: ['camp-tab'] },
  { name: '营地·成就', code: "campTab='achievements';render()", actions: ['camp-tab'] },
  { name: '营地·城镇', code: "campTab='town';render()", actions: ['building'] },
  { name: '地图', code: "campSection='camp';beginExpedition(game);render()", actions: ['node', 'retreat'] },
  { name: '地图·选中节点', code: "mapSelectedNode=reachableNodes(game)[0].id;render()", actions: ['enter-node'] },
];

test('每一屏都能渲染，产出干净，且不新增未登记的 data-action', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));

  for (const screen of SCREENS) {
    assert.doesNotThrow(() => run(ctx, screen.code), `「${screen.name}」渲染抛异常`);
    const html = root.innerHTML;
    assert.ok(html.length > 200, `「${screen.name}」渲染结果为空`);
    assert.match(html, /class="[^"]*content-view|class="[^"]*landing/, `「${screen.name}」没有输出视图容器`);
    assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/, `「${screen.name}」渲染出了脏数据`);

    const actions = extractActions(html);
    const unknown = actions.filter(a => !frozen.has(a));
    assert.deepEqual(unknown, [], `「${screen.name}」渲染出未登记的 data-action：${unknown.join(', ')}`);

    const missing = screen.actions.filter(a => !actions.includes(a));
    assert.deepEqual(missing, [], `「${screen.name}」缺少关键入口：${missing.join(', ')}`);
  }
});

test('战斗屏与结算屏：入口齐全，强制轮到英雄后技能坞可用', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));

  // 进入一场战斗（若首节点是事件/宝箱，继续走到战斗为止）
  run(ctx, "game=freshGame(9001);view='game';beginExpedition(game)");
  for (let i = 0; i < 8; i++) {
    if (run(ctx, "game.phase==='battle'")) break;
    run(ctx, "if(game.phase==='map'){const n=reachableNodes(game).find(x=>['battle','elite','boss'].includes(x.type))||reachableNodes(game)[0];enterNode(game,n.id);}else if(game.phase==='event'){resolveEvent(game,game.event.choices[0].kind);}");
  }
  assert.equal(run(ctx, "game.phase==='battle'"), true, '连续推进 8 次仍未进入战斗');

  run(ctx, "render()");
  const battleActions = extractActions(root.innerHTML);
  for (const a of ['unit', 'skill', 'basic-attack', 'end-turn', 'full-log']) {
    assert.ok(battleActions.includes(a), `战斗屏缺少入口 ${a}`);
  }

  // 强制轮到英雄，技能卡必须可点（不是全部 disabled）
  run(ctx, "const h=game.battle.heroes.find(x=>x.hp>0);if(h)game.battle.activeId=h.id;render()");
  const skillTags = root.innerHTML.match(/<button[^>]*data-action="skill"[^>]*>/g) || [];
  assert.ok(skillTags.length > 0, '英雄回合没有渲染技能卡');
  assert.ok(skillTags.some(t => !t.includes('disabled')), '英雄回合所有技能卡都被禁用（站位/目标校验可能出错）');

  // 完整战报浮层
  run(ctx, "fullLogOpen=true;render()");
  const logActions = extractActions(root.innerHTML);
  for (const a of ['copy-log', 'close-log']) assert.ok(logActions.includes(a), `战报浮层缺少入口 ${a}`);
  run(ctx, "fullLogOpen=false");

  // 结算屏：撤退只在地图阶段生效，因此回到地图阶段再撤
  run(ctx, "game=freshGame(9002);view='game';beginExpedition(game);retreat(game);render()");
  assert.match(root.innerHTML, /result-view/, '撤退后没有渲染结算屏');
  assert.ok(extractActions(root.innerHTML).includes('camp'), '结算屏缺少返回营地入口');
});

test('事件屏：任一非战斗节点都能渲染出可选项', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));

  run(ctx, "game=freshGame(777);view='game';beginExpedition(game)");
  let reached = false;
  for (let i = 0; i < 12 && !reached; i++) {
    run(ctx, "if(game.phase==='map'){const n=reachableNodes(game).find(x=>!['battle','elite','boss'].includes(x.type))||reachableNodes(game)[0];enterNode(game,n.id);}else if(game.phase==='battle'){retreat(game);beginExpedition(game);}");
    reached = run(ctx, "game.phase==='event'");
  }
  assert.equal(reached, true, '连续推进 12 次仍未进入事件屏');

  assert.doesNotThrow(() => run(ctx, "render()"), '事件屏渲染抛异常');
  assert.match(root.innerHTML, /event-view/, '事件屏结构缺失');
  const actions = extractActions(root.innerHTML);
  assert.ok(actions.includes('choice'), '事件屏没有可选项');
  assert.deepEqual(actions.filter(a => !frozen.has(a)), [], '事件屏渲染出未登记的 data-action');
});
