import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshGame,ensureProgression,isValidSave,DIFFICULTIES,TRAITS,CRISES,SKILLS,skillTrainingCost,skillLevel,trainSkill,
 selectDifficulty,beginExpedition,beginBattle,currentActor,performSkill,REGIONS,makeDungeon,enterNode,reachableNodes,
 resolveEvent,finishExpedition,heroStats,addStress,makeTrinket,TRINKET_BASES,AFFIXES,selectRegion
} from '../src/engine.js';

const camp=()=>freshGame(123456);
test('V0.6 new saves initialize skill levels, two personal traits, and selected difficulty',()=>{
 const s=camp();assert.equal(s.selectedDifficulty,'pilgrim');assert.equal(Object.keys(DIFFICULTIES).length,3);
 for(const h of s.heroes){assert.equal(h.traits.length,2);assert.equal(h.skillLevels[SKILLS.cleave&&h.classId==='warden'?'cleave':Object.keys(h.skillLevels)[0]],0);assert.ok(h.traits.every(t=>TRAITS[t]));}
 assert.ok(isValidSave(s));
});
test('skill training is camp-only and increases levels up to two, with prices and saves',()=>{
 const s=camp();s.gold=999;s.shards=999;let h=s.heroes[0];
 const a=skillTrainingCost(h,'cleave');assert.deepEqual(a,{gold:24,shards:2});
 assert.equal(trainSkill(s,h.id,'cleave'),true);assert.equal(skillLevel(h,'cleave'),1);
 assert.equal(s.gold,999-a.gold);assert.equal(trainSkill(s,h.id,'cleave'),true);assert.equal(skillLevel(h,'cleave'),2);
 assert.equal(trainSkill(s,h.id,'cleave'),false);assert.equal(trainSkill(s,h.id,'snipe'),false);
 assert.ok(isValidSave(JSON.parse(JSON.stringify(s))));
 beginExpedition(s);assert.equal(trainSkill(s,h.id,'cleave'),false);
});
test('upgraded skill increases damage using identical seeded battle rolls',()=>{
 const s=camp();s.gold=1000;s.shards=1000;const h=s.heroes[0];assert.equal(trainSkill(s,h.id,'cleave'),true);
 const a=structuredClone(s),b=structuredClone(s);b.heroes[0].skillLevels.cleave=0;
 for(const g of [a,b]){
  beginExpedition(g);beginBattle(g,'battle');
  const actor=g.battle.heroes.find(x=>x.id===h.id);actor.rank=1;g.battle.activeId=actor.id;
  g.battle.enemies.forEach((e,i)=>{e.rank=i+1;e.hp=999;e.maxHp=999;e.armor=0;});g.rngState=152;
 }
 const targetA=a.battle.enemies[0],targetB=b.battle.enemies[0];const idA=targetA.id,idB=targetB.id;
 assert.equal(performSkill(a,'cleave',idA).ok,true);assert.equal(performSkill(b,'cleave',idB).ok,true);
 assert.ok(999-targetA.hp>999-targetB.hp,`trained=${999-targetA.hp} base=${999-targetB.hp}`);
});
test('difficulty selection cannot change inside an expedition; enemy scaling and rewards are active',()=>{
 const a=camp(),b=camp();assert.equal(selectDifficulty(a,'nightmare'),true);assert.equal(selectDifficulty(b,'not-a-mode'),false);
 beginExpedition(a);beginExpedition(b);assert.equal(selectDifficulty(a,'veteran'),false);
 a.rngState=888;b.rngState=888;beginBattle(a,'boss');beginBattle(b,'boss');
 assert.ok(a.battle.enemies[0].maxHp>b.battle.enemies[0].maxHp);
 assert.ok(a.battle.enemies[0].attack>b.battle.enemies[0].attack);
 for(const s of [a,b]){s.expedition.lootGold=100;s.expedition.lootShards=20;finishExpedition(s,'retreat');}
 assert.ok(a.result.rewards.gold>b.result.rewards.gold);assert.ok(a.result.rewards.shards>b.result.rewards.shards);
});
test('three special rooms can be navigated and resolved; ambush leads to elite combat',()=>{
 for(const type of ['shrine','ambush','cache']){
  const s=camp();beginExpedition(s);const first=reachableNodes(s)[0];first.type=type;
  assert.equal(enterNode(s,first.id),true);assert.equal(s.phase,'event');
  if(type==='ambush'){assert.equal(resolveEvent(s,'ambush-fight'),true);assert.equal(s.phase,'battle');assert.equal(s.battle.kind,'elite');}
  if(type==='cache'){assert.equal(resolveEvent(s,'cache-loot'),true);assert.equal(s.phase,'map');assert.equal(s.expedition.lootItems.at(-1).rarity,'rare');}
  if(type==='shrine'){assert.equal(resolveEvent(s,'purge'),true);assert.equal(s.phase,'map');}
 }
});
test('crises are attributed at 100 stress and cured once pressure drops below 65',()=>{
 const s=camp(),h=s.heroes[0];h.stress=95;addStress(h,6);
 assert.equal(h.afflicted,true);assert.ok(CRISES[h.crisis]);
 const id=h.crisis;addStress(h,-40);assert.equal(h.crisis,null);assert.equal(h.afflicted,false);
 assert.ok(id);
});
test('new accessories have mixed bonuses and generated trinkets remain save-valid',()=>{
 const s=camp();assert.ok(Object.keys(TRINKET_BASES).length>=12);
 assert.ok(Object.keys(AFFIXES).length>=12);
 s.items.push(makeTrinket(s,'epic'));assert.ok(isValidSave(s));
});
test('old V0.5 camp and in-progress saves receive additive defaults',()=>{
 const s=camp();delete s.selectedDifficulty;for(const h of s.heroes){delete h.traits;delete h.skillLevels;delete h.crisis;}
 assert.equal(isValidSave(s),true);ensureProgression(s);assert.equal(s.selectedDifficulty,'pilgrim');assert.ok(s.heroes.every(h=>h.traits.length===2));
 beginExpedition(s);delete s.expedition.difficulty;beginBattle(s,'battle');delete s.battle.difficulty;
 assert.equal(isValidSave(s),true);ensureProgression(s);assert.equal(s.expedition.difficulty,'pilgrim');assert.equal(s.battle.difficulty,'pilgrim');
});
test('malformed new save data is rejected',()=>{
 const s=camp();s.selectedDifficulty='cheat';assert.equal(isValidSave(s),false);
 const t=camp();t.heroes[0].skillLevels.cleave=999;assert.equal(isValidSave(t),false);
 const u=camp();u.heroes[0].traits=['not-exist'];assert.equal(isValidSave(u),false);
});
