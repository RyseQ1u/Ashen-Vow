import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshGame,beginExpedition,enterNode,resolveEvent,reachableNodes,ensureProgression,isValidSave,
  V08_ROOMS,enemyIntent,createEnemy,expeditionSummary,finishExpedition,backToCamp,makeDungeon
} from '../src/engine.js';

function intoRoom(kind,seed=608){const s=freshGame(seed);beginExpedition(s);const n=reachableNodes(s)[0];n.type=kind;assert.equal(enterNode(s,n.id),true);return s;}

test('V0.8 map can generate oracle and caravan rooms in seeded exploration',()=>{
 const found=new Set();for(let seed=1;seed<=120;seed++){
  const s=freshGame(seed);const dungeon=makeDungeon(s);for(const n of dungeon.nodes)found.add(n.type);
 }
 assert.ok(found.has('oracle'));assert.ok(found.has('caravan'));
 assert.equal(Object.keys(V08_ROOMS).length,2);
});
test('oracle trade raises pressure and grants shards, can be saved',()=>{
 const s=intoRoom('oracle',722);const before=s.expedition.lootShards;
 assert.equal(s.phase,'event');assert.equal(s.event.title,'盲眼预言者');
 assert.equal(resolveEvent(s,'oracle-trade'),true);assert.equal(s.phase,'map');
 assert.ok(s.expedition.lootShards-before>=5);assert.ok(s.heroes.some(h=>h.stress>0));
 assert.equal(isValidSave(s),true);
});
test('oracle calming cannot be abused when player lacks gold',()=>{
 const s=intoRoom('oracle');s.gold=17;const snapshot=s.heroes.map(h=>h.stress);
 assert.equal(resolveEvent(s,'oracle-calm'),false);assert.equal(s.phase,'event');assert.equal(s.gold,17);
 assert.deepEqual(s.heroes.map(h=>h.stress),snapshot);
 s.gold=18;assert.equal(resolveEvent(s,'oracle-calm'),true);assert.equal(s.gold,0);
});
test('caravan supplies cost gold, escort earns bounded gold',()=>{
 const a=intoRoom('caravan');a.gold=24;const initial=a.expedition.torch;
 assert.equal(resolveEvent(a,'caravan-buy'),true);assert.equal(a.gold,0);
 assert.equal(a.expedition.torch,initial+2);assert.equal(a.expedition.bandages,4);
 const b=intoRoom('caravan');assert.equal(resolveEvent(b,'caravan-escort'),true);
 assert.ok(b.expedition.lootGold>=20&&b.expedition.lootGold<=34);
});
test('enemy intent is a nonrandom forecast for pressure, poison, heavy attacks and bosses',()=>{
 const s=freshGame(101),rng=s.rngState;
 const b={round:3};
 for(const [type,title] of [['cultist','精神侵蚀'],['sporewitch','毒素侵袭'],['butcher','撕裂重击'],['guardian','近战攻击'],['boss','群体威胁']]){
  const intent=enemyIntent({side:'enemy',type,hp:10},b);assert.equal(intent.title,title);
  assert.ok(intent.detail.length>0);
 }
 assert.equal(enemyIntent({side:'enemy',type:'cultist',hp:0},b),null);
 assert.equal(enemyIntent({side:'hero',type:'cultist',hp:9},b),null);
 assert.equal(s.rngState,rng);
});
test('V0.7 saves migrate with empty reports and no made-up economy numbers',()=>{
 const s=freshGame(177);delete s.expeditionReports;delete s.defeatStreak;
 assert.equal(isValidSave(s),true);ensureProgression(s);
 assert.deepEqual(s.expeditionReports,[]);assert.equal(s.defeatStreak,0);
 assert.equal(expeditionSummary(s).total,0);
});
test('victory and retreat add accurate summary, with a 20-record limit',()=>{
 const s=freshGame(84);
 for(let i=0;i<22;i++){
  beginExpedition(s);s.expedition.lootGold=i*10;s.expedition.lootShards=2;
  finishExpedition(s,i%2?'victory':'retreat');assert.equal(s.phase,'result');backToCamp(s);
 }
 const stats=expeditionSummary(s);
 assert.equal(stats.total,20);assert.equal(stats.reports.length,10);
 assert.equal(stats.victories,10);assert.ok(stats.reports[0].gold>=210); // region threat multipliers increase later runs
 assert.equal(stats.gold,s.expeditionReports.reduce((sum,r)=>sum+r.gold,0));
 assert.equal(isValidSave(s),true);
});
test('economy relief requires two consecutive defeats AND low gold, then resets',()=>{
 const s=freshGame(404);s.gold=0;s.supplies.torches=0;s.supplies.bandages=0;
 beginExpedition(s);finishExpedition(s,'defeat');assert.equal(s.gold,0);assert.equal(s.defeatStreak,1);backToCamp(s);
 beginExpedition(s);finishExpedition(s,'defeat');assert.equal(s.gold,40);assert.equal(s.defeatStreak,0);
 assert.equal(s.supplies.torches,3);assert.equal(s.supplies.bandages,1);
 assert.ok(s.history.some(x=>x.includes('紧急救济')));
});
test('defeat streak resets after retreat and relief cannot farm with adequate gold',()=>{
 const s=freshGame(405);s.gold=100;
 beginExpedition(s);finishExpedition(s,'defeat');assert.equal(s.defeatStreak,1);backToCamp(s);
 beginExpedition(s);finishExpedition(s,'defeat');assert.equal(s.gold,100);assert.equal(s.defeatStreak,2);backToCamp(s);
 beginExpedition(s);finishExpedition(s,'retreat');assert.equal(s.defeatStreak,0);
});

test('malformed new economic records and streak are rejected at import',()=>{
 const s=freshGame(103);s.expeditionReports=[{day:1,region:'crypt',difficulty:'pilgrim',reason:'victory',rooms:3,gold:50,shards:2}];
 assert.equal(isValidSave(s),true);s.expeditionReports[0].gold=-99;assert.equal(isValidSave(s),false);
 s.expeditionReports[0].gold=50;s.defeatStreak=-1;assert.equal(isValidSave(s),false);
});
