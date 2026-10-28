import test from 'node:test';
import assert from 'node:assert/strict';
import {freshGame,CLASSES,ENEMIES,SKILLS,beginExpedition,reachableNodes,enterNode,resolveEvent,retreat,backToCamp,finishExpedition,
  heroStats,hireRecruit,swapHero,dismissReserve,makeTrinket,trinketMods,equipTrinket,unequipTrinket,salvageTrinket,
  ensureProgression,isValidSave,beginBattle,performSkill,currentActor,validTargets,skipTurn,MAX_RESERVES} from '../src/engine.js';

test('V0.3 starts with four active heroes and three recruits, deterministically',()=>{
 const a=freshGame(808),b=freshGame(808);
 assert.equal(a.heroes.length,4);assert.equal(a.recruits.length,3);
 assert.deepEqual(a.recruits,b.recruits);
 assert.equal(a.reserveHeroes.length,0);assert.deepEqual(a.items,[]);
 assert.equal(isValidSave(a),true);
});

test('hire and replace heroes while keeping exactly four active and unique ids',()=>{
 const game=freshGame(541),original=[...game.heroes];
 game.gold=1000;
 const offer=game.recruits[0],oldBalance=game.gold;
 assert.equal(hireRecruit(game,0),true);
 assert.equal(game.gold,oldBalance-65);
 assert.equal(game.reserveHeroes[0].classId,offer.classId);
 assert.equal(game.reserveHeroes[0].name,offer.name);
 assert.equal(game.heroes.length,4);
 const reserve=game.reserveHeroes[0],oldActive=game.heroes[1];
 assert.equal(swapHero(game,oldActive.id,reserve.id),true);
 assert.equal(game.heroes[1].id,reserve.id);assert.equal(game.heroes[1].rank,2);
 assert.equal(game.reserveHeroes[0].id,oldActive.id);assert.equal(game.reserveHeroes[0].rank,0);
 assert.equal(new Set([...game.heroes,...game.reserveHeroes].map(h=>h.id)).size,5);
 assert.equal(dismissReserve(game,oldActive.id),true);
 assert.equal(dismissReserve(game,'unknown'),false);
 assert.equal(isValidSave(game),true);
 beginExpedition(game);
 assert.equal(hireRecruit(game,0),false);
 assert.equal(swapHero(game,original[0].id,reserve.id),false);
});

test('recruit roster caps and gold checks, including old saved games',()=>{
 const game=freshGame(25);game.gold=0;
 assert.equal(hireRecruit(game,0),false);game.gold=5000;
 for(let expedition=0;expedition<5;expedition++){
  for(let i=0;i<3;i++)if(game.recruits.length)hireRecruit(game,0);
  if(game.reserveHeroes.length>=MAX_RESERVES)break;
  beginExpedition(game);finishExpedition(game,'retreat');backToCamp(game);
 }
 assert.equal(game.reserveHeroes.length,MAX_RESERVES);
 const gold=game.gold;
 assert.equal(hireRecruit(game,0),false);assert.equal(game.gold,gold);
 const legacy=freshGame(78);
 for(const k of ['reserveHeroes','recruits','items','nextItemId','nextHeroId'])delete legacy[k];
 legacy.heroes.forEach(h=>delete h.trinkets);
 assert.equal(isValidSave(legacy),true);
 ensureProgression(legacy);
 assert.equal(legacy.recruits.length,3);
 assert.equal(hireRecruit(legacy,0),true);
 assert.equal(new Set([...legacy.heroes,...legacy.reserveHeroes].map(h=>h.id)).size,5);
});

test('trinkets have seeded item generation, distinct identities, stats and two slots',()=>{
 const state=freshGame(993),copy=freshGame(993);
 const first=makeTrinket(state,'epic');const equal=makeTrinket(copy,'epic');
 assert.deepEqual(first,equal);
 const second=makeTrinket(state,'rare');state.items.push(first,second);
 const h=state.heroes[0],base=heroStats(h,state),mods=trinketMods(first);
 assert.equal(equipTrinket(state,h.id,first.id,0),true);
 assert.equal(heroStats(h,state).attack,base.attack+(mods.attack||0));
 assert.equal(heroStats(h,state).maxHp,base.maxHp+(mods.hp||0));
 assert.equal(equipTrinket(state,state.heroes[1].id,first.id,0),false);
 assert.equal(equipTrinket(state,h.id,second.id,1),true);
 assert.equal(equipTrinket(state,h.id,first.id,1),false);
 assert.equal(salvageTrinket(state,first.id),false);
 assert.equal(unequipTrinket(state,h.id,0),true);
 assert.equal(salvageTrinket(state,first.id),true);
 assert.equal(salvageTrinket(state,first.id),false);
 assert.equal(isValidSave(state),true);
});

test('treasure becomes claimable inventory only after surviving return',()=>{
 const state=freshGame(4);
 beginExpedition(state);assert.equal(enterNode(state,'0-1'),true);
 assert.equal(state.phase,'event');assert.equal(resolveEvent(state,'chest'),true);
 assert.equal(state.expedition.lootItems.length,1);
 assert.equal(state.items.length,0);
 retreat(state);
 assert.equal(state.result.rewards.items.length,1);
 assert.equal(state.items.length,1);
 backToCamp(state);assert.equal(state.recruits.length,3);
 assert.equal(isValidSave(state),true);
 const lost=freshGame(9);beginExpedition(lost);enterNode(lost,'0-1');resolveEvent(lost,'chest');
 finishExpedition(lost,'defeat');assert.equal(lost.items.length,0);
 assert.equal(lost.result.rewards.items.length,0);
});

test('new enemy roster, elite guaranteed rare and boss guaranteed epic',()=>{
 for(const id of ['bonearcher','banshee','butcher','herald'])assert.ok(ENEMIES[id]);
 const state=freshGame(9);beginExpedition(state);beginBattle(state,'elite');
 state.battle.enemies.forEach(e=>e.hp=0);
 // resolve through one engine turn
 const actor=currentActor(state);
 if(actor?.side==='hero')skipTurn(state);
 assert.equal(state.phase,'map');assert.equal(state.expedition.lootItems.length,1);
 assert.equal(state.expedition.lootItems[0].rarity,'rare');
 const boss=freshGame(19);beginExpedition(boss);beginBattle(boss,'boss');
 boss.battle.enemies.forEach(e=>e.hp=0);
 if(currentActor(boss)?.side==='hero')skipTurn(boss);
 assert.equal(boss.phase,'result');assert.equal(boss.result.rewards.items.length,1);
 assert.equal(boss.items[0].rarity,'epic');
});

test('additional class skills work with valid targets and saved class identities',()=>{
 const g=freshGame(89);g.gold=500;
 g.recruits=[{classId:'duelist',name:'决斗者'},{classId:'penitent',name:'行者'}];
 assert.equal(hireRecruit(g,0),true);assert.equal(hireRecruit(g,0),true);
 swapHero(g,g.heroes[0].id,g.reserveHeroes[0].id);
 swapHero(g,g.heroes[1].id,g.reserveHeroes[1].id);
 assert.equal(g.heroes[0].classId,'duelist');assert.equal(g.heroes[1].classId,'penitent');
 assert.deepEqual(CLASSES.duelist.skills,['bloodlet','puncture','taunt']);
 assert.deepEqual(CLASSES.penitent.skills,['scourge','atonement','sacrifice']);
 beginExpedition(g);beginBattle(g,'battle');
 let acted=false;
 for(let i=0;i<10&&!acted&&g.phase==='battle';i++){
  const actor=currentActor(g);if(actor.side!=='hero')continue;
  const usable=CLASSES[actor.classId].skills.find(id=>SKILLS[id].caster.includes(actor.rank)&&validTargets(g.battle,actor,SKILLS[id]).length);
  if(!usable){skipTurn(g);continue;}
  const target=validTargets(g.battle,actor,SKILLS[usable])[0];
  assert.equal(performSkill(g,usable,target.id).ok,true);
  acted=true;
 }
 assert.equal(acted,true);assert.equal(isValidSave(g),true);
});
