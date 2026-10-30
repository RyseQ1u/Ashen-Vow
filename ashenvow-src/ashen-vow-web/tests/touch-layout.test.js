// 触控与按键布局方案（2026-10-29）契约测试
// 只锁「结构可达性」：键位是否存在、是否带长按标记、镜像是否真的反序、节点是否有放大热区。
// 具体 px 由 style.css 决定，这里不重复断言数值，避免样式微调就红一片。
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { loadUI } from './harness.js';

const run = (ctx, code) => vm.runInContext(code, ctx);

function enterBattle(ctx) {
  run(ctx, "game=freshGame(9001);view='game';beginExpedition(game)");
  for (let i = 0; i < 8; i++) {
    if (run(ctx, "game.phase==='battle'")) break;
    run(ctx, "if(game.phase==='map'){const n=reachableNodes(game).find(x=>['battle','elite','boss'].includes(x.type))||reachableNodes(game)[0];enterNode(game,n.id);}else if(game.phase==='event'){resolveEvent(game,game.event.choices[0].kind);}");
  }
  assert.equal(run(ctx, "game.phase==='battle'"), true, '未能进入战斗');
  run(ctx, "const h=game.battle.heroes.find(x=>x.hp>0);if(h)game.battle.activeId=h.id;render()");
}

test('战斗屏 A 区：技能卡一排 + 普攻/结束回合主操作 + 3 个 44pt 次级键', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));
  enterBattle(ctx);
  const html = root.innerHTML;

  // 本作每个职业 3 项技能；普攻已从技能坞移到主操作行，坞内不应再有第 4 张普攻卡。
  const expect = run(ctx, "currentActor(game)&&currentActor(game).side==='hero'?CLASSES[currentActor(game).classId].skills.length:0");
  const skillCards = html.match(/<button[^>]*data-action="skill"[^>]*>/g) || [];
  assert.ok(expect >= 3, `职业技能数异常：${expect}`);
  assert.equal(skillCards.length, expect, `技能坞应恰好 ${expect} 张技能卡（不含普攻），实际 ${skillCards.length}`);
  assert.doesNotMatch(html.match(/<div class="skill-card-grid">[\s\S]*?<\/div>/)[0], /data-action="basic-attack"/, '普攻不应再占技能坞格子');

  const primary = html.match(/<div class="battle-main-actions">[\s\S]*?<\/div>/);
  assert.ok(primary, '缺少主操作行');
  assert.match(primary[0], /class="btn battle-attack/, '主操作行缺少普攻键');
  assert.match(primary[0], /data-action="basic-attack"/, '普攻键 action 丢失');
  assert.match(primary[0], /data-action="end-turn"[^>]*data-hold="end-turn"/, '结束回合缺少长按确认标记');
  assert.match(primary[0], /class="hold-ring"/, '结束回合缺少长按进度环');

  const tools = html.match(/<div class="battle-tools">[\s\S]*?<\/div>/);
  assert.ok(tools, '缺少次级操作行');
  for (const a of ['full-log', 'skip', 'unit']) {
    assert.match(tools[0], new RegExp(`data-action="${a}"`), `次级行缺少 ${a} 入口`);
  }
});

test('左右手镜像：技能卡阅读顺序反向，序号仍跟随技能本身', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));
  enterBattle(ctx);

  const ids = () => (root.innerHTML.match(/data-action="skill" data-id="([a-z]+)"/g) || [])
    .map(t => t.replace(/.*data-id="|"/g, ''));
  const right = ids();
  assert.ok(right.length >= 3, '镜像测试需要至少 3 张技能卡');

  run(ctx, "settings.hand='left';render()");
  const left = ids();
  assert.deepEqual(left, [...right].reverse(), '左手模式下技能卡顺序未反向');

  run(ctx, "settings.hand='right';render()");
  assert.deepEqual(ids(), right, '切回右手后顺序未恢复');
});

test('地图屏：撤退收进 D 区、节点命中区放大、进入节点 CTA 带独占类名', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));
  run(ctx, "game=freshGame(9002);view='game';beginExpedition(game);mapSelectedNode=reachableNodes(game)[0].id;render()");
  const html = root.innerHTML;

  assert.match(html, /<div class="map-head"><button class="map-exit" data-action="retreat"/, '撤退未落在地图头部左上角');
  assert.match(html, /<circle r="40" class="node-hit"\/>/, '节点缺少放大的命中热区');
  assert.match(html, /class="btn btn-gold btn-full map-enter"/, '进入节点 CTA 缺少 map-enter 类名');

  // 撤退不应再占底部面板（那里只留一个主操作）
  const aside = html.match(/<aside class="panel map-aside">[\s\S]*?<\/aside>/);
  assert.ok(aside, '缺少地图情报面板');
  assert.doesNotMatch(aside[0], /data-action="retreat"/, '底部面板仍有撤退入口，主操作不唯一');
});

test('地图补给条：4 人各带药剂/圣徽，且受伤时可用（防再次被面板遮住而删掉）', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));
  run(ctx, `game=freshGame(9006);view='game';beginExpedition(game);
    game.expedition.potions=2; game.expedition.sigils=2;
    game.heroes[0].hp=Math.max(1,game.heroes[0].maxHp-10); render();`);
  const html = root.innerHTML;

  assert.match(html, /class="map-team-strip"/, '地图缺少远征队伍补给条');
  assert.match(html, /<div class="map-strip-row">/, '补给条缺少队伍行');

  const uses = html.match(/data-action="use-potion"/g) || [];
  const sigils = html.match(/data-action="use-sigil"/g) || [];
  assert.equal(uses.length, 4, `应给 4 名英雄各一个药剂键，实际 ${uses.length}`);
  assert.equal(sigils.length, 4, `应给 4 名英雄各一个圣徽键，实际 ${sigils.length}`);

  // 掉血的那位英雄，药剂键必须是可点的（不是 disabled）
  const firstPotion = html.match(/<button[^>]*data-action="use-potion"[^>]*>/);
  assert.ok(firstPotion, '缺少药剂按钮');
  assert.doesNotMatch(firstPotion[0], /disabled/, '队伍有伤且药剂充足时，药剂键仍被禁用');
});

test('营地与设置：出发 64pt 底栏、惯用手开关存在', async () => {
  const { ctx, root } = loadUI();
  await Promise.resolve(); await new Promise(r => setImmediate(r));

  run(ctx, "game=freshGame(9003);view='game';campSection='camp';render()");
  assert.match(root.innerHTML, /class="btn btn-red camp-depart"/, '营地缺少固定底栏出发键');

  run(ctx, "view='settings';render()");
  const html = root.innerHTML;
  assert.match(html, /data-mirror="right"/, '设置缺少右手选项');
  assert.match(html, /data-mirror="left"/, '设置缺少左手选项');
  assert.match(html, /惯用手/, '设置缺少惯用手说明');
  // 镜像开关不能被登记成 data-action（65 条契约里没有这一项）
  assert.doesNotMatch(html, /data-action="mirror/, '镜像开关误用了 data-action');
});
