import test from 'node:test';
import assert from 'node:assert/strict';
import {
  freshGame,beginExpedition,reachableNodes,enterNode,isValidSave,ensureProgression,
  nodePreview,teamPower,usePotion,useSigil,buySupplies,MAX_SUPPLIES,SUPPLY_META
} from '../src/engine.js';

function onMap(seed=42){const g=freshGame(seed);beginExpedition(g);return g;}

test('makeDungeon assigns proper node names and expedition supplies',()=>{
  const g=onMap(11);
  assert.ok(g.expedition.nodes.every(n=>typeof n.name==='string'&&n.name.length>0),'nodes have proper names');
  assert.equal(g.expedition.potions,g.supplies.potions);
  assert.equal(g.expedition.sigils,g.supplies.sigils);
  assert.ok(isValidSave(g));
});

test('nodePreview returns encounters, rewards, risk and power',()=>{
  const g=onMap(22);
  const id=reachableNodes(g)[0].id;
  const p=nodePreview(g,id);
  assert.ok(p,'preview exists');
  assert.equal(p.id,id);
  assert.ok(Array.isArray(p.encounters)&&p.encounters.length>0);
  assert.ok(Array.isArray(p.rewards)&&p.rewards.length>0);
  assert.ok(p.risk>=1&&p.risk<=5,'risk is 1-5 skulls');
  assert.ok(Number.isFinite(p.power));
  assert.ok(typeof p.name==='string'&&p.name.length>0);
  assert.ok(teamPower(g)>0);
});

test('two-step entry: preview does not mutate, enterNode does',()=>{
  const g=onMap(33);
  const id=reachableNodes(g)[0].id;
  const before=JSON.stringify(g.expedition.nodes);
  nodePreview(g,id);
  assert.equal(JSON.stringify(g.expedition.nodes),before,'preview is read-only');
  assert.equal(enterNode(g,id),true);
  assert.ok(g.expedition.visited.includes(id));
});

test('usePotion heals and consumes from expedition stock',()=>{
  const g=onMap(44);
  g.expedition.potions=2;
  g.heroes[0].hp=5;
  assert.equal(usePotion(g,'hero-0'),true);
  assert.equal(g.heroes[0].hp,37);
  assert.equal(g.expedition.potions,1);
  assert.equal(usePotion(g,'hero-0'),true);
  assert.equal(usePotion(g,'hero-0'),false,'stock exhausted');
});

test('useSigil relieves stress and consumes stock',()=>{
  const g=onMap(55);
  g.expedition.sigils=1;
  g.heroes[1].stress=60;
  assert.equal(useSigil(g,'hero-1'),true);
  assert.equal(g.heroes[1].stress,42);
  assert.equal(g.expedition.sigils,0);
  assert.equal(useSigil(g,'hero-1'),false);
});

test('buySupplies respects four-type meta and capacity caps',()=>{
  const g=freshGame(66);
  g.gold=500;
  assert.equal(buySupplies(g,'potions'),true);
  assert.equal(g.supplies.potions,2);
  assert.equal(buySupplies(g,'sigils'),true);
  assert.equal(g.supplies.sigils,1);
  for(let i=0;i<20;i++)buySupplies(g,'sigils');
  assert.equal(g.supplies.sigils,MAX_SUPPLIES.sigils,'sigils capped');
  assert.equal(buySupplies(g,'nope'),false);
  assert.ok(Object.keys(SUPPLY_META).length===4);
  assert.ok(isValidSave(g));
});

test('legacy saves without potions/sigils are backfilled and valid',()=>{
  const g=onMap(77);
  delete g.supplies.potions;delete g.supplies.sigils;
  delete g.expedition.potions;delete g.expedition.sigils;
  for(const n of g.expedition.nodes)delete n.name;
  ensureProgression(g);
  assert.equal(g.supplies.potions,0);
  assert.equal(g.supplies.sigils,0);
  assert.ok(g.expedition.nodes.every(n=>n.name));
  assert.equal(isValidSave(g),true);
});
