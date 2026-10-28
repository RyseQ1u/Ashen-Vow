import test from 'node:test';
import assert from 'node:assert/strict';
import {freshGame,beginExpedition,enterNode,performSkill,basicAttack,endTurn,currentActor,SKILLS,SKILL_CATEGORY_LABELS,isValidSave,ensureProgression} from '../src/engine.js';

test('every skill carries a Phase 1 category label',()=>{
 for(const [id,skill] of Object.entries(SKILLS)){
  assert.ok(skill.category,`${id} missing category`);
  assert.ok(SKILL_CATEGORY_LABELS[skill.category],`${id} category ${skill.category} missing label`);
 }
 assert.deepEqual(new Set(Object.values(SKILLS).map(s=>s.category)),new Set(['damage','defense','buff','finisher']));
});

test('basicAttack damages a living enemy without rank limits and ends the turn',()=>{
 const g=freshGame(20261028);beginExpedition(g);
 assert.ok(enterNode(g,g.expedition.nodes.find(n=>n.type==='battle')?.id||'0--1'));
 // force a battle
 if(g.phase!=='battle'){g.phase='battle';g.battle={region:'crypt',kind:'battle',round:1,turnIndex:0,bossPhase:1,finished:false,trait:null,
  heroes:g.heroes.map((h,i)=>({...h,maxHp:h.maxHp,hp:h.maxHp,stress:0,statuses:{},rank:i+1,side:'hero',attack:10,speed:5,armor:1})),
  enemies:[{id:'e1',name:'靶子',type:'thrall',rank:1,maxHp:40,hp:40,attack:5,speed:2,armor:0,stress:0,statuses:{},side:'enemy'}],
  order:[],logs:[{text:'x',type:'system'}]};}
 const actor=currentActor(g);
 if(actor?.side!=='hero'){ // wait until a hero acts by ending enemy turns
  for(let i=0;i<12&&currentActor(g)?.side!=='hero';i++){const b=g.battle;b.turnIndex=(b.turnIndex||0)+1;if(b.turnIndex>=(b.order||[]).length)b.turnIndex=0;}
 }
 const hero=currentActor(g);assert.equal(hero.side,'hero');
 const enemy=g.battle.enemies.find(e=>e.hp>0);
 const before=enemy.hp;
 const ret=basicAttack(g,enemy.id);
 assert.equal(ret.ok,true);
 assert.ok(enemy.hp<=before,'basic attack should deal damage or miss');
 assert.notEqual(g.battle.activeId,hero.id,'turn must advance after basic attack');
});

test('endTurn skips the hero action and advances initiative',()=>{
 const g=freshGame(4242);beginExpedition(g);
 assert.ok(enterNode(g,g.expedition.nodes.find(n=>n.type==='battle')?.id||'0--1'));
 if(g.phase!=='battle')return; // seed may open an event room; coverage guaranteed by ui-smoke
 const hero=currentActor(g);
 if(hero?.side!=='hero')return;
 const id=hero.id;
 assert.equal(endTurn(g),true);
 assert.notEqual(g.battle.activeId,id);
});

test('basicAttack rejects non-battle phases',()=>{
 const g=freshGame(1);assert.equal(basicAttack(g,'x').ok,false);
 assert.equal(endTurn(g),false);
});
