import test from 'node:test';
import assert from 'node:assert/strict';
import {freshGame,beginExpedition,reachableNodes,enterNode,resolveEvent,performSkill,SKILLS,CLASSES,currentActor,validTargets,skipTurn,finishExpedition,backToCamp,healAtCamp,upgradeHero,isValidSave} from '../src/engine.js';
function progressBattle(g){for(let j=0;j<300&&g.phase==='battle';j++){
 const actor=currentActor(g);if(!actor)throw new Error('Missing actor');
 if(actor.side!=='hero')throw new Error('Enemy must act automatically');
 let done=false;
 for(const id of CLASSES[actor.classId].skills){const sk=SKILLS[id];if(!sk.caster.includes(actor.rank))continue;const ts=validTargets(g.battle,actor,sk);if(!ts.length)continue;
  const target=sk.side==='ally'?ts.sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]:ts[0];
  if(sk.side==='ally'&&sk.type==='heal'&&target.hp/target.maxHp>.65)continue;
  assert.equal(performSkill(g,id,target.id).ok,true);done=true;break;
 }
 if(!done)assert.equal(skipTurn(g),true);
 }
 if(g.phase==='battle')throw new Error('Battle exceeded 300 turns');}
test('initial roster and serialized save',()=>{const g=freshGame(12345);assert.equal(g.heroes.length,4);assert.equal(g.phase,'camp');assert.ok(isValidSave(g));assert.deepEqual(freshGame(12345).heroes,g.heroes);});
test('deterministic seeded map, reachability',()=>{const g=freshGame(31337),h=freshGame(31337);beginExpedition(g);beginExpedition(h);assert.deepEqual(g.expedition,h.expedition);assert.equal(reachableNodes(g).length,3);assert.ok(isValidSave(g));});
test('node exploration preserves game save',()=>{const g=freshGame(7);beginExpedition(g);let node=reachableNodes(g).find(n=>n.type==='event');assert.equal(enterNode(g,node.id),true);assert.equal(g.phase,'event');assert.equal(resolveEvent(g,'leave'),true);assert.equal(g.phase,'map');assert.ok(isValidSave(g));});
test('camp healing and level-up costs',()=>{const g=freshGame(77);g.heroes[0].hp=5;const oldGold=g.gold;assert.equal(healAtCamp(g,'hero-0'),true);assert.equal(g.gold,oldGold-20);assert.ok(g.heroes[0].hp>5);const oldLevel=g.heroes[0].level;assert.equal(upgradeHero(g,'hero-0'),true);assert.equal(g.heroes[0].level,oldLevel+1);assert.ok(isValidSave(g));});
test('safe end-to-end run through encounters for 10 seeds',()=>{for(let seed=1;seed<=10;seed++){
 const g=freshGame(seed);beginExpedition(g);
 for(let tier=0;tier<5&&['map','battle','event'].includes(g.phase);tier++){
  const node=reachableNodes(g)[0];assert.ok(node,'Expected reachable node');assert.ok(enterNode(g,node.id));
  if(g.phase==='battle')progressBattle(g);
  if(g.phase==='event')resolveEvent(g,g.event.choices[1].kind);
  if(g.phase==='result')break;
  assert.ok(isValidSave(g),'save schema valid during run');
 }
 assert.ok(['map','result'].includes(g.phase),'Game should be in supported state');
 if(g.phase==='map')finishExpedition(g,'retreat');
 assert.equal(g.phase,'result');assert.equal(backToCamp(g),true);assert.ok(isValidSave(g));
 }});

test('V0.2 gear upgrades modify stats and are compatible with V0.1 saves',async()=>{
 const {forgeGear,moveHero,heroStats}=await import('../src/engine.js');
 const game=freshGame(123),hero=game.heroes[0],original=heroStats(hero);
 assert.equal(forgeGear(game,hero.id,'weapon'),true);
 assert.equal(heroStats(hero).attack,original.attack+2);
 assert.equal(hero.gear.weapon,1);
 assert.equal(forgeGear(game,hero.id,'armor'),true);
 assert.equal(heroStats(hero).armor,original.armor+1);
 assert.equal(heroStats(hero).maxHp,original.maxHp+3);
 assert.equal(hero.hp,hero.maxHp);
 assert.equal(moveHero(game,hero.id,1),true);
 assert.equal(game.heroes[1].id,hero.id);
 assert.equal(game.heroes[1].rank,2);
 assert.equal(isValidSave(game),true);
 game.phase='map';
 assert.equal(forgeGear(game,hero.id,'weapon'),false);
 assert.equal(moveHero(game,hero.id,-1),false);
 const oldSave=freshGame(63);oldSave.heroes.forEach(h=>delete h.gear);
 assert.equal(isValidSave(oldSave),true);
 assert.equal(heroStats(oldSave.heroes[0]).attack,CLASSES.warden.attack);
});

test('V0.2 workshop caps and costs protect save invariants',async()=>{
 const {forgeGear}=await import('../src/engine.js');
 const game=freshGame(44),hero=game.heroes[0];
 game.gold=999;game.shards=999;
 for(let i=0;i<3;i++)assert.equal(forgeGear(game,hero.id,'weapon'),true);
 assert.equal(hero.gear.weapon,3);
 const gold=game.gold,shards=game.shards;
 assert.equal(forgeGear(game,hero.id,'weapon'),false);
 assert.equal(forgeGear(game,hero.id,'boots'),false);
 assert.equal(game.gold,gold);assert.equal(game.shards,shards);
 assert.equal(isValidSave(game),true);
});
