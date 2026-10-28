import test from 'node:test';
import assert from 'node:assert/strict';
// Transaction-shaped in-memory test double; production still uses browser IndexedDB.
const tables={saves:new Map(),backups:new Map()};
const db={objectStoreNames:{contains:n=>Boolean(tables[n]),},createObjectStore(name){tables[name]=new Map()},transaction(names){
 const tx={oncomplete:null,onerror:null,onabort:null};let pending=0,closed=false;
 const schedule=(cb)=>{pending++;setTimeout(()=>{cb();pending--;if(!pending&&!closed){closed=true;setTimeout(()=>tx.oncomplete?.(),0)}},0)};
 tx.objectStore=name=>({get(key){const req={result:null,onsuccess:null,onerror:null};schedule(()=>{req.result=structuredClone(tables[name].get(key));req.onsuccess?.()});return req;},
 getAll(){const req={result:null,onsuccess:null,onerror:null};schedule(()=>{req.result=[...tables[name].values()].map(x=>structuredClone(x));req.onsuccess?.()});return req;},
 put(item){schedule(()=>tables[name].set(name==='saves'?item.slot:item.key,structuredClone(item)));},
 delete(key){schedule(()=>tables[name].delete(key));}
 });return tx;
 }};
globalThis.indexedDB={open(){const req={result:db,onupgradeneeded:null,onsuccess:null,onerror:null};setTimeout(()=>{req.onupgradeneeded?.();req.onsuccess?.()},0);return req;}};
const {getSlot,storeSlot,listBackups,restoreBackup,allSlots,readSaveFile,deleteSlot,snapshotChecksum}=await import('../src/storage.js');
const {freshGame,isValidSave}=await import('../src/engine.js');

test('saves roundtrip with two rolling snapshots and deterministic metadata',async()=>{
 await deleteSlot(1);
 const s=freshGame(1);await storeSlot(1,s);
 s.gold=200;await storeSlot(1,s);
 s.gold=300;await storeSlot(1,s);
 assert.equal((await getSlot(1)).gold,300);
 const backups=await listBackups(1);
 assert.deepEqual(backups.map(b=>b.age),[1,2]);
 assert.equal(backups[0].valid,true);
 assert.equal(backups[1].valid,true);
 assert.equal((await allSlots()).find(s=>s.slot===1).checksum.length,8);
});
test('restore creates new main save from older snapshot',async()=>{
 const prev=await listBackups(1);assert.equal(prev.length,2);
 await restoreBackup(1,2,isValidSave);
 assert.equal((await getSlot(1)).gold,145);
 const roll=await listBackups(1);assert.equal(roll[0].valid,true);
});
test('tampered current save is rejected without destroying prior valid backup',async()=>{
 const main=tables.saves.get(1);main.data.gold=9999;
 await assert.rejects(()=>getSlot(1),/完整性校验失败/);
 assert.ok((await listBackups(1)).some(b=>b.valid));
 await restoreBackup(1,1,isValidSave);
 assert.ok(isValidSave(await getSlot(1)));
});
test('invalid backup is rejected and current save is retained',async()=>{
 const current=(await getSlot(1)).gold;
 const snapshot=tables.backups.get('1-1');snapshot.data.gold=-10;
 await assert.rejects(()=>restoreBackup(1,1,isValidSave),/丢失、损坏/);
 assert.equal((await getSlot(1)).gold,current);
});
test('export checksum validation accepts legacy JSON and rejects corruption',async()=>{
 const data=freshGame(99);
 const payload={format:'ashen-vow-save',schemaVersion:1,slot:1,data,checksum:snapshotChecksum(data)};
 assert.ok(isValidSave(await readSaveFile({size:500,text:async()=>JSON.stringify(payload)},isValidSave)));
 payload.data.gold++;
 await assert.rejects(()=>readSaveFile({size:500,text:async()=>JSON.stringify(payload)},isValidSave),/校验码/);
 delete payload.checksum;
 assert.ok(isValidSave(await readSaveFile({size:500,text:async()=>JSON.stringify(payload)},isValidSave)));
 await assert.rejects(()=>readSaveFile({size:3*1024*1024,text:async()=>''},isValidSave),/过大/);
});
test('deleting slot clears current and both backups',async()=>{
 await deleteSlot(1);
 assert.equal(await getSlot(1),null);assert.equal((await listBackups(1)).length,0);
 await assert.rejects(()=>storeSlot(0,freshGame(99)),/无效/);
});
