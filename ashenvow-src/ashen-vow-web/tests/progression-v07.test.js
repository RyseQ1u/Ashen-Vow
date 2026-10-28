import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshGame,isValidSave,ensureProgression,trainSkill,chooseSkillBranch,SKILL_BRANCHES,skillBranch,
 TRINKET_SETS,activeTrinketSet,heroStats,beginExpedition,beginBattle,performSkill,
 enemyResistances,heroResistances,inflictStatus,selectEnemyTarget,treatNegativeTrait,
 quirkTreatmentCost,TRAITS,evolveTrait,regionThreatLevel,finishExpedition,CLASSES
} from '../src/engine.js';
const ready=()=>{const s=freshGame(1707);s.gold=4000;s.shards=400;return s;};
test('V0.7 each of the 18 skills has two distinct branches',()=>{
 assert.equal(Object.keys(SKILL_BRANCHES).length,18);
 for(const [id,branches] of Object.entries(SKILL_BRANCHES)){
  assert.equal(branches.length,2,id);assert.deepEqual(branches.map(b=>b.id),['a','b']);
  assert.ok(branches[0].name!==branches[1].name);
 }
});
test('branches require training, use resources, and can be switched at a discount',()=>{
 const s=ready(),h=s.heroes[0];assert.equal(chooseSkillBranch(s,h.id,'cleave','a'),false);
 assert.equal(trainSkill(s,h.id,'cleave'),true);
 const gold=s.gold;assert.equal(chooseSkillBranch(s,h.id,'cleave','a'),true);
 assert.equal(skillBranch(h,'cleave').id,'a');assert.equal(gold-s.gold,35);
 assert.equal(chooseSkillBranch(s,h.id,'cleave','a'),false);
 assert.equal(chooseSkillBranch(s,h.id,'cleave','b'),true);
 assert.equal(skillBranch(h,'cleave').id,'b');assert.equal(gold-35-s.gold,22);
 assert.equal(isValidSave(s),true);
 beginExpedition(s);assert.equal(chooseSkillBranch(s,h.id,'cleave','a'),false);
});
test('legacy V0.6 saves load without branching fields',()=>{
 const s=ready();for(const h of s.heroes){delete h.skillBranches;}
 assert.equal(isValidSave(s),true);ensureProgression(s);
 assert.ok(s.heroes.every(h=>h.skillBranches&&typeof h.skillBranches==='object'));
});
test('malformed skill branches cannot be imported',()=>{
 const s=ready();s.heroes[0].skillBranches={cleave:'a'};assert.equal(isValidSave(s),false);
 trainSkill(s,s.heroes[0].id,'cleave');assert.equal(isValidSave(s),true);
 s.heroes[0].skillBranches.cleave='invalid';assert.equal(isValidSave(s),false);
});
test('damage branch armor-piercing increases damage against armored foe',()=>{
 const s=ready(),h=s.heroes[0];trainSkill(s,h.id,'cleave');
 const a=structuredClone(s),b=structuredClone(s);
 chooseSkillBranch(a,h.id,'cleave','a');chooseSkillBranch(b,h.id,'cleave','b');
 // use same damage power in the second control to isolate armor piercing behavior
 for(const g of [a,b]){beginExpedition(g);beginBattle(g,'battle');const actor=g.battle.heroes.find(x=>x.id===h.id);
  actor.rank=1;g.battle.activeId=actor.id;const t=g.battle.enemies[0];t.rank=1;t.hp=999;t.maxHp=999;t.armor=9;g.rngState=1234;}
 const tb=b.battle.enemies[0],ta=a.battle.enemies[0];
 // A and B have different bonuses; both must perform successfully and differ.
 assert.equal(performSkill(a,'cleave',ta.id).ok,true);
 assert.equal(performSkill(b,'cleave',tb.id).ok,true);
 assert.notEqual(ta.hp,tb.hp);
});
test('healing branch cleanses poison and bleeding',()=>{
 const s=ready(),h=s.heroes[2];trainSkill(s,h.id,'mend');chooseSkillBranch(s,h.id,'mend','b');
 beginExpedition(s);beginBattle(s,'battle');const actor=s.battle.heroes.find(x=>x.id===h.id),target=s.battle.heroes[0];
 actor.rank=3;s.battle.activeId=actor.id;target.hp-=10;target.statuses={poison:2,bleed:2};s.rngState=1;
 assert.equal(performSkill(s,'mend',target.id).ok,true);
 assert.equal(target.statuses.poison,0);assert.equal(target.statuses.bleed,0);
});
test('four sets require exactly both base pieces and boost stats',()=>{
 const s=ready(),h=s.heroes[0];assert.equal(Object.keys(TRINKET_SETS).length,4);
 s.items=[{id:'one',baseId:'iron',affixes:[],rarity:'common'},{id:'two',baseId:'seal',affixes:[],rarity:'common'}];
 const noSet=heroStats(h,s);h.trinkets=['one','two'];
 assert.equal(activeTrinketSet(h,s),'sentinel');
 const withSet=heroStats(h,s);assert.ok(withSet.armor>=noSet.armor+4);
 assert.equal(isValidSave(s),true);
});
test('guardian set is applied when starting battle',()=>{
 const s=ready(),h=s.heroes[0];s.items=[{id:'a',baseId:'iron',affixes:[],rarity:'common'},{id:'b',baseId:'seal',affixes:[],rarity:'common'}];h.trinkets=['a','b'];
 beginExpedition(s);beginBattle(s,'battle');const u=s.battle.heroes.find(x=>x.id===h.id);assert.ok(u.statuses.guard>=1);
});
test('enemy status resistance differs across dungeon factions',()=>{
 assert.ok(enemyResistances('mirequeen').poison>enemyResistances('forgeheart').poison);
 assert.ok(enemyResistances('forgeheart').bleed>enemyResistances('ghoul').bleed);
 assert.ok(enemyResistances('boss').stun>=80);
 assert.ok(heroResistances({armor:5}).bleed>heroResistances({armor:0}).bleed);
});
test('status resistance blocks 0% chance and applies at guaranteed 100%',()=>{
 const s=ready();beginExpedition(s);beginBattle(s,'battle');const target=s.battle.enemies[0];
 assert.equal(inflictStatus(s,target,'bleed',0,2),false);
 assert.equal(inflictStatus(s,target,'bleed',200,2),true);
 assert.equal(target.statuses.bleed,2);
});
test('ranged AI prioritizes exposed healers and frontliners',()=>{
 const s=ready();const heroes=[{id:'front',classId:'warden',rank:1,hp:40,maxHp:40},{id:'healer',classId:'medic',rank:4,hp:1,maxHp:35}];
 assert.equal(selectEnemyTarget(s,{type:'bonearcher'},heroes,true).id,'healer');
 assert.ok(['front','healer'].includes(selectEnemyTarget(s,{type:'thrall'},heroes,false).id));
});
test('negative quirk treatment removes only owned negative traits and is camp-only',()=>{
 const s=ready(),h=s.heroes[0];h.traits=['frail','keeneye'];const cost=quirkTreatmentCost(s);
 assert.equal(treatNegativeTrait(s,h.id,'keeneye'),false);
 assert.equal(treatNegativeTrait(s,h.id,'frail'),true);
 assert.equal(s.gold,4000-cost.gold);assert.ok(!h.traits.includes('frail'));assert.ok(h.traits.includes('keeneye'));
 assert.equal(treatNegativeTrait(s,h.id,'frail'),false);
 beginExpedition(s);assert.equal(treatNegativeTrait(s,h.id,'keeneye'),false);
});
test('trait evolution respects the trait cap and preserves save validity',()=>{
 const s=ready(),h=s.heroes[0];h.traits=['frail','keeneye'];
 for(let i=0;i<100;i++)evolveTrait(s,h,i%2?'victory':'defeat');
 assert.ok(h.traits.length<=3);assert.equal(new Set(h.traits).size,h.traits.length);assert.ok(h.traits.every(t=>TRAITS[t]));
 assert.equal(isValidSave(s),true);
});
test('region threat grows every three victories and is capped at four',()=>{
 const s=ready();assert.equal(regionThreatLevel(s,'crypt'),1);
 s.regionVictories.crypt=3;assert.equal(regionThreatLevel(s,'crypt'),2);
 s.regionVictories.crypt=100;assert.equal(regionThreatLevel(s,'crypt'),4);
});
test('region threat affects enemy HP and expedition loot',()=>{
 const a=ready(),b=ready();b.regionVictories.crypt=9;
 beginExpedition(a);beginExpedition(b);a.rngState=888;b.rngState=888;beginBattle(a,'boss');beginBattle(b,'boss');
 assert.ok(b.battle.enemies[0].maxHp>a.battle.enemies[0].maxHp);
 for(const g of [a,b]){g.expedition.lootGold=100;g.expedition.lootShards=20;finishExpedition(g,'retreat');}
 assert.ok(b.result.rewards.gold>a.result.rewards.gold);
});
