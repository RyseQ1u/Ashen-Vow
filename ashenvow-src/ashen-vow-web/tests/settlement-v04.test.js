import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshGame,ensureProgression,isValidSave,BUILDINGS,MAX_BUILDING_LEVEL,
 buildingLevel,buildingCost,upgradeBuilding,healAtCamp,campHealCost,campPrayerCost,prayAtCamp,
 upgradeHero,allocateTalent,TALENTS,heroStats,selectExpeditionPlan,beginExpedition,
 finishExpedition,backToCamp,forgeGear,hireRecruit,EXPEDITION_PLANS
} from '../src/engine.js';

test('V0.4 new saves include town levels, plans and talent points',()=>{
 const g=freshGame(1313);
 assert.equal(isValidSave(g),true);
 assert.deepEqual(Object.keys(g.buildings),Object.keys(BUILDINGS));
 assert.equal(g.expeditionPlan,'standard');
 assert.equal(g.heroes[0].talentPoints,0);
 assert.deepEqual(Object.keys(g.heroes[0].talents),Object.keys(TALENTS));
});
test('V0.1-V0.3 saves are upgradeable without altering existing hero stats',()=>{
 const g=freshGame(36);g.heroes[0].level=3;
 const before={gold:g.gold,shards:g.shards,level:g.heroes[0].level};
 delete g.buildings;delete g.expeditionPlan;
 g.heroes.forEach(h=>{delete h.talents;delete h.talentPoints;});
 assert.equal(isValidSave(g),true);
 ensureProgression(g);
 assert.equal(isValidSave(g),true);
 assert.equal(g.gold,before.gold);assert.equal(g.shards,before.shards);
 assert.equal(g.heroes[0].level,before.level);
 assert.equal(g.heroes[0].talentPoints,2);
 assert.deepEqual(g.buildings,{infirmary:0,chapel:0,workshop:0,watchtower:0});
});
test('building cost, level cap, affordability and non-camp restrictions',()=>{
 const g=freshGame(99);g.gold=3000;g.shards=3000;
 for(const id of Object.keys(BUILDINGS)){
  for(let lv=0;lv<MAX_BUILDING_LEVEL;lv++){
   const c=buildingCost(g,id),before=g.gold;
   assert.equal(upgradeBuilding(g,id),true);
   assert.equal(buildingLevel(g,id),lv+1);assert.equal(g.gold,before-c.gold);
  }
  assert.equal(upgradeBuilding(g,id),false);
 }
 assert.equal(upgradeBuilding(g,'not-real'),false);
 beginExpedition(g);
 assert.equal(upgradeBuilding(g,'chapel'),false);
 const broke=freshGame(59);broke.gold=0;broke.shards=0;
 assert.equal(upgradeBuilding(broke,'chapel'),false);
});
test('infirmary improves camp healing without paying if action is invalid',()=>{
 const g=freshGame(28);const hero=g.heroes[0];g.gold=700;g.shards=700;
 hero.hp=1;hero.stress=60;
 assert.equal(campHealCost(g),20);assert.equal(upgradeBuilding(g,'infirmary'),true);
 assert.equal(campHealCost(g),18);
 const before=g.gold;assert.equal(healAtCamp(g,hero.id),true);
 assert.equal(g.gold,before-18);assert.equal(hero.hp,29);assert.equal(hero.stress,33);
 hero.hp=hero.maxHp;hero.stress=0;
 const unchanged=g.gold;assert.equal(healAtCamp(g,hero.id),false);assert.equal(g.gold,unchanged);
});
test('chapel prayers, gold cost, and passive reserve recovery only on return',()=>{
 const g=freshGame(425);g.gold=900;g.shards=900;
 assert.equal(upgradeBuilding(g,'chapel'),true);
 assert.equal(campPrayerCost(g),15);
 const h=g.heroes[1];h.stress=70;
 const before=g.gold;
 assert.equal(prayAtCamp(g,h.id),true);
 assert.equal(g.gold,before-15);assert.equal(h.stress,36);
 assert.equal(prayAtCamp(g,'missing'),false);
 assert.equal(hireRecruit(g,0),true);
 const reserve=g.reserveHeroes[0];reserve.stress=30;reserve.hp=3;
 assert.equal(upgradeBuilding(g,'infirmary'),true);
 beginExpedition(g);finishExpedition(g,'retreat');
 assert.equal(reserve.stress,24);assert.equal(reserve.hp,6);
 assert.equal(prayAtCamp(g,reserve.id),false);
 backToCamp(g);assert.equal(prayAtCamp(g,reserve.id),true);
});
test('workshop discount is actually applied to forging',()=>{
 const g=freshGame(383);g.gold=500;g.shards=100;
 assert.equal(upgradeBuilding(g,'workshop'),true);
 const gold=g.gold;
 assert.equal(forgeGear(g,g.heroes[0].id,'weapon'),true);
 assert.equal(g.gold,gold-20);
});
test('watchtower adds expedition torches, caution adds bandages and plan locks during expedition',()=>{
 const g=freshGame(86);g.gold=500;g.shards=100;
 assert.equal(upgradeBuilding(g,'watchtower'),true);
 assert.equal(selectExpeditionPlan(g,'cautious'),true);
 const startingTorches=g.supplies.torches,startingBandages=g.supplies.bandages;
 assert.equal(beginExpedition(g),true);
 assert.equal(g.expedition.torch,startingTorches+2+1);
 assert.equal(g.expedition.bandages,startingBandages+1);
 assert.equal(g.expedition.plan,'cautious');
 assert.equal(selectExpeditionPlan(g,'daring'),false);
});
test('daring rewards are applied on return; losses do not receive multiplier',()=>{
 const g=freshGame(751);const stresses=g.heroes.map(h=>h.stress);
 selectExpeditionPlan(g,'daring');beginExpedition(g);
 assert.equal(g.expedition.torch,3);
 assert.deepEqual(g.heroes.map(h=>h.stress),stresses.map(x=>x+10));
 g.expedition.lootGold=100;g.expedition.lootShards=12;
 const gold=g.gold,shards=g.shards;
 finishExpedition(g,'retreat');
 assert.equal(g.gold-gold,135);assert.equal(g.shards-shards,15);
 const g2=freshGame(751);selectExpeditionPlan(g2,'daring');beginExpedition(g2);
 g2.expedition.lootGold=100;g2.expedition.lootShards=12;
 const before=g2.gold;finishExpedition(g2,'defeat');
 assert.equal(g2.gold-before,35);assert.equal(g2.result.rewards.shards,0);
});
test('talent points from hero upgrades affect stats; each talent is capped at 2',()=>{
 const g=freshGame(399);g.gold=1000;g.shards=1000;
 const h=g.heroes[0],base=heroStats(h,g);
 assert.equal(allocateTalent(g,h.id,'might'),false);
 assert.equal(upgradeHero(g,h.id),true);
 assert.equal(h.talentPoints,1);
 assert.equal(allocateTalent(g,h.id,'might'),true);
 assert.equal(heroStats(h,g).attack,base.attack+2+1);
 assert.equal(allocateTalent(g,h.id,'vigor'),false);
 assert.equal(upgradeHero(g,h.id),true);
 assert.equal(allocateTalent(g,h.id,'vigor'),true);
 assert.equal(heroStats(h,g).maxHp,base.maxHp+8+5);
 assert.equal(upgradeHero(g,h.id),true);
 assert.equal(allocateTalent(g,h.id,'might'),true);
 assert.equal(allocateTalent(g,h.id,'might'),false);
 beginExpedition(g);assert.equal(allocateTalent(g,h.id,'vigor'),false);
});
test('malformed V0.4 building, expedition mode and talent fields are rejected',()=>{
 const g=freshGame(42);g.buildings.chapel=99;assert.equal(isValidSave(g),false);
 g.buildings.chapel=0;g.expeditionPlan='hack';assert.equal(isValidSave(g),false);
 g.expeditionPlan='standard';g.heroes[0].talents.vigor=-1;assert.equal(isValidSave(g),false);
});
