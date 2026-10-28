import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshGame,ensureProgression,isValidSave,selectRegion,REGIONS,ELITE_TRAITS,beginExpedition,
 beginBattle,enterNode,resolveEvent,finishExpedition,backToCamp,regionOf,createEnemy,
 currentActor,performSkill,advanceTurn
} from '../src/engine.js';

function inRegion(id, seed=91){const game=freshGame(seed);assert.ok(selectRegion(game,id));assert.ok(beginExpedition(game));return game;}
test('three regions have distinct enemies, bosses, environmental rules and positive rewards',()=>{
 assert.deepEqual(Object.keys(REGIONS),['crypt','mire','forge']);
 for(const r of Object.values(REGIONS)){
  assert.equal(r.boss.length,3);
  assert.ok(r.enemies.length>=5);
  assert.ok(r.goldMult>=1&&r.shardMult>=1);
  assert.ok(r.hazard.length>10);
  assert.ok(ELITE_TRAITS[r.eliteTrait]);
 }
});
test('new games select crypt and count victories by region',()=>{
 const g=freshGame(40);assert.equal(g.selectedRegion,'crypt');assert.equal(isValidSave(g),true);
 assert.deepEqual(g.regionVictories,{crypt:0,mire:0,forge:0});
 assert.equal(selectRegion(g,'mire'),true);assert.equal(g.selectedRegion,'mire');
 assert.equal(selectRegion(g,'missing'),false);assert.equal(g.selectedRegion,'mire');
});
test('selection locks after expedition begins and persists across return',()=>{
 const g=inRegion('forge');assert.equal(regionOf(g),'forge');
 assert.equal(g.expedition.region,'forge');assert.equal(selectRegion(g,'mire'),false);
 finishExpedition(g,'retreat');backToCamp(g);
 assert.equal(g.selectedRegion,'forge');assert.equal(selectRegion(g,'mire'),true);
});
test('each biome loads a unique boss and an appropriate elite trait',()=>{
 for(const id of Object.keys(REGIONS)){
  const g=inRegion(id);beginBattle(g,'boss');
  assert.equal(g.battle.region,id);
  assert.equal(g.battle.enemies[0].type,REGIONS[id].boss[0]);
  assert.equal(g.battle.bossPhase,1);
  g.phase='map';beginBattle(g,'elite');
  assert.equal(g.battle.trait,REGIONS[id].eliteTrait);
  assert.deepEqual(g.battle.enemies.map(e=>e.type),REGIONS[id].elite);
 }
});
test('elite fortified armor and relentless speed/attack affect enemy combat stats',()=>{
 let g=inRegion('crypt');beginBattle(g,'elite');
 assert.equal(g.battle.enemies[0].armor,createEnemy(g,'guardian',1).armor+2);
 g=inRegion('forge');beginBattle(g,'elite');
 assert.equal(g.battle.enemies[0].speed,createEnemy(g,'ironreaver',1).speed+2);
 assert.equal(g.battle.enemies[0].attack,createEnemy(g,'ironreaver',1).attack+2);
});
test('the themed random encounter draws only from the selected biome',()=>{
 for(const id of Object.keys(REGIONS))for(let seed=1;seed<=16;seed++){
  const g=inRegion(id,seed);beginBattle(g,'battle');
  assert.ok(g.battle.enemies.every(e=>REGIONS[id].enemies.includes(e.type)),id);
 }
});
test('old V0.4 camp saves gain defaults and retain hero / inventory state',()=>{
 const g=freshGame(291);g.items.push({id:'item-2',rarity:'rare',baseId:'iron',affixes:['keen']});
 const ref=structuredClone(g.heroes[0]);delete g.selectedRegion;delete g.regionVictories;
 assert.equal(isValidSave(g),true);ensureProgression(g);
 assert.equal(g.selectedRegion,'crypt');assert.equal(g.regionVictories.crypt,0);
 assert.deepEqual(g.heroes[0],ref);assert.equal(g.items.length,1);
});
test('old V0.4 mid-expedition and mid-battle saves migrate to crypt safely',()=>{
 const g=inRegion('mire');delete g.expedition.region;delete g.selectedRegion;
 assert.equal(isValidSave(g),true);ensureProgression(g);
 assert.equal(regionOf(g),'crypt');
 beginBattle(g,'battle');delete g.battle.region;delete g.battle.bossPhase;
 assert.equal(isValidSave(g),true);ensureProgression(g);
 assert.equal(g.battle.region,'crypt');assert.equal(g.battle.bossPhase,1);
});
test('region-specific event creates real selectable choices and resolves rewards',()=>{
 for(const id of Object.keys(REGIONS)){
  const g=inRegion(id);assert.equal(enterNode(g,'0-0'),true);
  assert.equal(g.phase,'event');assert.ok(g.event.choices.length>=2);
  const kind=g.event.choices[0].kind;
  const before=g.expedition.lootShards;
  assert.equal(resolveEvent(g,kind),true);assert.equal(g.phase,'map');
  if(id==='mire'||id==='forge')assert.ok(g.expedition.lootShards>before);
 }
});
test('no-torch mire event supplies a valid escape choice',()=>{
 const g=inRegion('mire');g.expedition.torch=0;enterNode(g,'0-0');
 assert.equal(g.event.choices[1].kind,'leave-mire');
 assert.equal(resolveEvent(g,'leave-mire'),true);
});
test('regional win bonuses apply to gold, shards and victory counters only on boss win',()=>{
 for(const id of Object.keys(REGIONS)){
  const g=inRegion(id);g.expedition.lootGold=100;g.expedition.lootShards=20;
  const gold=g.gold,shards=g.shards;
  finishExpedition(g,'victory');
  assert.equal(g.gold-gold,Math.floor(100*REGIONS[id].goldMult));
  assert.equal(g.shards-shards,Math.floor(20*REGIONS[id].shardMult));
  assert.equal(g.regionVictories[id],1);assert.equal(g.result.region,id);
 }
});
test('failed journeys do not obtain the region multiplier or victory credit',()=>{
 const g=inRegion('forge');g.expedition.lootGold=100;g.expedition.lootShards=50;
 const gold=g.gold;finishExpedition(g,'defeat');
 assert.equal(g.gold-gold,35);assert.equal(g.result.rewards.shards,0);
 assert.equal(g.regionVictories.forge,0);
});
test('invalid or crafted region data in save is rejected',()=>{
 const g=freshGame(4);g.selectedRegion='unknown';assert.equal(isValidSave(g),false);
 g.selectedRegion='crypt';g.regionVictories.forge=-1;assert.equal(isValidSave(g),false);
 g.regionVictories.forge=0;beginExpedition(g);g.expedition.region='future';assert.equal(isValidSave(g),false);
});
test('boss evolves to phases 2 and 3 and gains reinforcements or pressure',()=>{
 const g=inRegion('crypt',551);beginBattle(g,'boss');
 const boss=g.battle.enemies[0];
 boss.hp=Math.ceil(boss.maxHp*.65)+1;
 for(let i=0;i<12&&g.battle.bossPhase<2;i++){
  const hero=g.battle.heroes.find(h=>h.classId==='occult');
  g.battle.activeId=hero.id;
  const enemy=g.battle.enemies.find(e=>e.type==='boss');
  if(enemy.hp<=0)break;
  performSkill(g,'cinder',enemy.id);
 }
 assert.equal(g.battle.bossPhase,2);
 assert.ok(g.battle.enemies.some(e=>e.type==='thrall'&&e.rank>=1));
 boss.hp=Math.ceil(boss.maxHp*.30)+1;
 for(let i=0;i<12&&g.battle.bossPhase<3;i++){
  const hero=g.battle.heroes.find(h=>h.classId==='occult');g.battle.activeId=hero.id;
  performSkill(g,'cinder',boss.id);
 }
 assert.equal(g.battle.bossPhase,3);
 assert.ok(boss.armor>=4);
});
