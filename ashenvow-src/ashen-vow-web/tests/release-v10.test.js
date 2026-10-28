import test from 'node:test';
import assert from 'node:assert/strict';
import {freshGame,ensureProgression,isValidSave,ACHIEVEMENTS,unlockAchievements,finishExpedition,beginExpedition,backToCamp,selectRegion} from '../src/engine.js';
import {snapshotChecksum,snapshotValid} from '../src/storage.js';

test('V1.0 adds 12 achievement definitions with stable IDs',()=>{
 assert.equal(Object.keys(ACHIEVEMENTS).length,12);
 assert.equal(new Set(Object.keys(ACHIEVEMENTS)).size,12);
});
test('new games open tutorial and legacy games skip first-time tutorial',()=>{
 const v10=freshGame(7);assert.equal(v10.tutorialSeen,false);
 const v09=freshGame(8);delete v09.tutorialSeen;delete v09.achievements;
 assert.equal(isValidSave(v09),true);
 ensureProgression(v09);assert.equal(v09.tutorialSeen,true);assert.deepEqual(v09.achievements,{});
});
test('achievement migration grants only demonstrably earned milestones',()=>{
 const s=freshGame(77);delete s.achievements;s.expeditions=5;s.regionVictories.crypt=1;
 ensureProgression(s);
 assert.equal(s.achievements.first,s.day);assert.equal(s.achievements.steady,s.day);assert.equal(s.achievements.crypt,s.day);
 assert.equal(s.achievements.three,undefined);assert.equal(s.achievements.seasoned,undefined);
});
test('unlocked achievements persist and cannot be farmed for resources',()=>{
 const s=freshGame(45);const gold=s.gold,shards=s.shards;
 s.expeditions=1;assert.deepEqual(unlockAchievements(s),['first']);
 assert.deepEqual(unlockAchievements(s),[]);
 assert.equal(s.gold,gold);assert.equal(s.shards,shards);
 assert.equal(isValidSave(s),true);
});
test('victory unlocks region achievement through real settlement',()=>{
 const s=freshGame(123);selectRegion(s,'mire');beginExpedition(s);finishExpedition(s,'victory');
 assert.ok(s.achievements.first);assert.ok(s.achievements.mire);
 assert.equal(s.achievements.forge,undefined);
 assert.equal(isValidSave(s),true);backToCamp(s);
});
test('three region completion unlocks achievement when legacy victories are present',()=>{
 const s=freshGame(99);s.regionVictories={crypt:1,mire:1,forge:1};
 assert.ok(unlockAchievements(s).includes('three'));
});
test('achievement and tutorial import data rejects unknown or malformed state',()=>{
 const s=freshGame(21);s.achievements.bad=1;assert.equal(isValidSave(s),false);
 delete s.achievements.bad;s.achievements.first=-2;assert.equal(isValidSave(s),false);
 s.achievements.first=1;s.tutorialSeen='true';assert.equal(isValidSave(s),false);
 s.tutorialSeen=true;assert.equal(isValidSave(s),true);
});
test('campaign resource tampering or inconsistent phases fail validation',()=>{
 const s=freshGame(24);s.gold=-1;assert.equal(isValidSave(s),false);s.gold=10;
 s.shards=Infinity;assert.equal(isValidSave(s),false);s.shards=5;
 s.supplies.bandages=-1;assert.equal(isValidSave(s),false);s.supplies.bandages=1;
 s.phase='battle';assert.equal(isValidSave(s),false);
});
test('checksums detect changed data and preserve legacy records without checksum',()=>{
 const s=freshGame(78);const record={data:structuredClone(s),checksum:snapshotChecksum(s)};
 assert.ok(snapshotValid(record));record.data.gold++;assert.equal(snapshotValid(record),false);
 assert.ok(snapshotValid({data:s}));
});
test('all 3 difficulty multipliers remain monotonic and bounded',async()=>{
 const {DIFFICULTIES}=await import('../src/engine.js');
 assert.deepEqual(Object.keys(DIFFICULTIES),['pilgrim','veteran','nightmare']);
 for(const field of ['hp','attack','gold','shards']){
  assert.ok(DIFFICULTIES.pilgrim[field]<=DIFFICULTIES.veteran[field]);
  assert.ok(DIFFICULTIES.veteran[field]<=DIFFICULTIES.nightmare[field]);
  assert.ok(DIFFICULTIES.nightmare[field]<=2);
 }
});
