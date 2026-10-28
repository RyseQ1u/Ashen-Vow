import test from 'node:test';
import assert from 'node:assert/strict';
import {battleTelemetry,eventPresentation,cueForTelemetry} from '../src/presentation.js';
function snap(heroes,enemies=[],logs=[],round=1){return {heroes,enemies,logs,round,finished:false};}
const unit=(id,hp,stress=0,statuses={})=>({id,hp,stress,statuses});
const log=(text,type='hit')=>({text,type});
test('combat telemetry captures multi-target damage and stress without mutating either snapshot',()=>{
 const before=snap([unit('a',30,0),unit('b',25,0)], [unit('m',20)], [log('old')]);
 const after=snap([unit('a',20,8),unit('b',21,4)],[unit('m',20)],[log('new'),log('old')]);
 const beforeText=JSON.stringify(before),afterText=JSON.stringify(after);
 const out=battleTelemetry(before,after);
 assert.equal(out.effects.filter(e=>e.kind==='damage').length,2);
 assert.equal(out.effects.filter(e=>e.kind==='stress').length,2);
 assert.deepEqual(out.logs,[log('new')]);
 assert.equal(JSON.stringify(before),beforeText);assert.equal(JSON.stringify(after),afterText);
 assert.equal(cueForTelemetry(out),'hit');
});
test('status application, poison stack and summons are individually exposed',()=>{
 const before=snap([unit('h',30)],[unit('e',11,0,{poison:1})],[log('old')]);
 const after=snap([unit('h',30)],[unit('e',11,0,{poison:3,weak:2}),unit('e2',18)],[log('弱化','system'),log('old')]);
 const out=battleTelemetry(before,after);
 assert.deepEqual(out.effects.filter(e=>e.kind==='status').map(e=>e.status),['poison','weak']);
 assert.equal(out.effects.find(e=>e.id==='e2').kind,'summon');
 assert.equal(cueForTelemetry(out),'event');
});
test('critical healing, calming, death and round transitions use correct cues',()=>{
 const before=snap([unit('h',20,45)],[unit('e',5)],[log('old')]);
 const after=snap([unit('h',30,30)],[unit('e',0)],[log('致命暴击','hit'),log('old')],2);
 const out=battleTelemetry(before,after);
 assert.equal(out.critical,true);assert.equal(out.roundChanged,true);
 assert.ok(out.effects.some(e=>e.kind==='death'&&e.value===5));
 assert.ok(out.effects.some(e=>e.kind==='calm'&&e.value===15));
 assert.equal(cueForTelemetry(out),'crit');
});
test('battle telemetry tolerates missing log overlap, incomplete data and null cases',()=>{
 assert.equal(battleTelemetry(null,null).effects.length,0);
 const out=battleTelemetry(snap([unit('x',10)],[],[log('different')]),snap([unit('x',10)],[],[log('new')]));
 assert.deepEqual(out.logs,[log('new')]);
});
test('event illustrations distinguish region and motifs and are safe for unknown events',()=>{
 assert.equal(eventPresentation({title:'断轮商队'},'mire').motif,'caravan');
 assert.equal(eventPresentation({title:'伏击回廊'},'forge').motif,'ambush');
 assert.equal(eventPresentation({title:'预言祭坛'},'crypt').motif,'oracle');
 assert.equal(eventPresentation({title:'失落秘库'},'crypt').motif,'cache');
 assert.equal(eventPresentation({title:'灰烬篝火'},'crypt').motif,'rest');
 assert.equal(eventPresentation({title:'未知谜题'},'bad').region,'crypt');
});
test('presentation does not affect deterministic combat rules',async()=>{
 const {freshGame,beginExpedition,enterNode}=await import('../src/engine.js');
 const s=freshGame(2026);beginExpedition(s);enterNode(s,'0--1');
 const original=JSON.stringify(s);
 battleTelemetry(s.battle,s.battle);eventPresentation(s.event,'mire');
 assert.equal(JSON.stringify(s),original);
});
