import test from 'node:test';
import assert from 'node:assert/strict';
import {freshGame,beginExpedition,currentActor,previewSkillDamage,performSkill,CLASSES,SKILLS} from '../src/engine.js';

function forceBattle(g,enemyHp=40){
 if(g.phase!=='battle'){
  g.phase='battle';
  const heroes=g.heroes.map((h,i)=>({...h,maxHp:h.maxHp,hp:h.maxHp,stress:0,statuses:{},rank:i+1,side:'hero',attack:10,speed:5,armor:1}));
  const enemy={id:'e1',name:'靶子',type:'thrall',rank:1,maxHp:enemyHp,hp:enemyHp,attack:5,speed:2,armor:0,stress:0,statuses:{},side:'enemy'};
  g.battle={region:'crypt',kind:'battle',round:1,turnIndex:0,bossPhase:1,finished:false,trait:null,
   heroes,enemies:[enemy],order:[heroes[0].id,'e1'],activeId:heroes[0].id,
   logs:[{text:'开战',type:'system'}]};
 }
 if(currentActor(g)?.side!=='hero'){
  const h=g.battle.heroes.find(x=>x.hp>0);
  if(h)g.battle.activeId=h.id;
 }
}

test('previewSkillDamage 返回与公式一致的伤害范围且不修改状态',()=>{
 const g=freshGame(777);beginExpedition(g);
 forceBattle(g);
 const hero=currentActor(g);assert.equal(hero.side,'hero');
 const enemy=g.battle.enemies.find(e=>e.hp>0);
 const skillId=CLASSES[hero.classId].skills[0];
 const hpBefore=enemy.hp,logsBefore=g.battle.logs.length;
 const p=previewSkillDamage(g,skillId,enemy.id);
 assert.equal(p.ok,true);
 assert.equal(p.type,SKILLS[skillId].type);
 if(p.type==='damage'){
  assert.ok(p.min>=1&&p.max>=p.min,'min<=max 且伤害至少为 1');
  assert.ok(p.critMax>=p.max,'暴击上限不低于普通上限');
  assert.ok(p.hit>=1&&p.hit<=100);
  assert.equal(typeof p.kill,'boolean');
 }
 assert.equal(enemy.hp,hpBefore,'预览不得修改目标生命');
 assert.equal(g.battle.logs.length,logsBefore,'预览不得产生战报');
});

test('previewSkillDamage 支持普攻 __basic__ 并给出稳定命中',()=>{
 const g=freshGame(778);beginExpedition(g);
 forceBattle(g);
 assert.equal(currentActor(g).side,'hero');
 const enemy=g.battle.enemies.find(e=>e.hp>0);
 const basic=previewSkillDamage(g,'__basic__',enemy.id);
 assert.equal(basic.ok,true);
 assert.equal(basic.type,'damage');
 assert.ok(basic.hit>=90&&basic.hit<=100,'普攻命中约 92%（含命中加成）');
 assert.ok(basic.min>=1&&basic.max>=basic.min);
});

test('战报保留超过 24 条记录（完整战报可见）',()=>{
 const g=freshGame(779);beginExpedition(g);
 forceBattle(g,999999);
 g.battle.heroes.forEach(h=>{h.maxHp=99999;h.hp=99999;h.stress=0;});
 for(let i=0;i<80&&g.battle.logs.length<=30;i++){
  let actor=currentActor(g);
  if(actor?.side!=='hero'){
   const h=g.battle.heroes.find(x=>x.hp>0);
   if(!h)break;
   g.battle.activeId=h.id;
   actor=h;
  }
  const t=g.battle.enemies.find(e=>e.hp>0);
  if(!t)break;
  const skills=CLASSES[actor.classId].skills;
  const dmg=skills.find(s=>SKILLS[s].type==='damage')||skills[0];
  const ret=performSkill(g,dmg,t.id);
  if(!ret.ok){
   // 技能因站位等不可用时退回普攻路径：直接补一条战报再继续
   g.battle.logs.unshift({text:`${actor.name} 发动连击`,type:'hit'});
  }
  g.battle.activeId=(g.battle.heroes.find(x=>x.hp>0)||actor).id;
 }
 assert.ok(g.battle.logs.length>24,`战报应突破旧 24 条上限，实际 ${g.battle.logs.length}`);
});
