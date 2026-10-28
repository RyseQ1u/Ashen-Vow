// All data remains in the current browser's IndexedDB. No network access.
// V1.0: rolling snapshots with integrity checks and explicit rollback.
export const SLOT_COUNT=3;
const DB_NAME='ashen-vow-local-v1';
let dbPromise;
function database(){
 if(!('indexedDB' in globalThis))return Promise.reject(new Error('当前浏览器不支持 IndexedDB；请改用正常浏览器窗口'));
 if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,1);
  req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains('saves'))d.createObjectStore('saves',{keyPath:'slot'});if(!d.objectStoreNames.contains('backups'))d.createObjectStore('backups',{keyPath:'key'});};
  req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>{db.close();dbPromise=null;};resolve(db);};
  req.onerror=()=>{dbPromise=null;reject(req.error||new Error('存档数据库无法打开'));};
 });
 return dbPromise;
}
export function snapshotChecksum(data){
 const content=JSON.stringify(data);let hash=2166136261;
 for(let i=0;i<content.length;i++){hash^=content.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return (hash>>>0).toString(16).padStart(8,'0');
}
export function snapshotValid(record){return Boolean(record?.data)&&(!record.checksum||record.checksum===snapshotChecksum(record.data));}
export async function allSlots(){const db=await database();return new Promise((resolve,reject)=>{const req=db.transaction('saves','readonly').objectStore('saves').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function getSlot(slot){const db=await database();return new Promise((resolve,reject)=>{const req=db.transaction('saves','readonly').objectStore('saves').get(slot);req.onsuccess=()=>{if(req.result&&!snapshotValid(req.result))reject(Error(`存档 ${slot} 完整性校验失败，请从历史快照恢复`));else resolve(req.result?.data||null);};req.onerror=()=>reject(req.error);});}
export async function storeSlot(slot,data){
 if(!Number.isInteger(slot)||slot<1||slot>SLOT_COUNT)throw Error('无效存档槽位');
 const db=await database();const snapshot=structuredClone(data);snapshot.updatedAt=new Date().toISOString();
 const current={slot,data:snapshot,updatedAt:snapshot.updatedAt,checksum:snapshotChecksum(snapshot)};
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['saves','backups'],'readwrite'),saves=tx.objectStore('saves'),backups=tx.objectStore('backups');
  const prev=saves.get(slot);
  prev.onsuccess=()=>{
   const earlier=backups.get(`${slot}-1`);
   earlier.onsuccess=()=>{
    if(earlier.result&&snapshotValid(earlier.result))backups.put({...earlier.result,key:`${slot}-2`});
    if(prev.result&&snapshotValid(prev.result))backups.put({key:`${slot}-1`,slot,data:prev.result.data,updatedAt:prev.result.updatedAt,checksum:prev.result.checksum||snapshotChecksum(prev.result.data)});
    saves.put(current);
   };
  };
  tx.oncomplete=()=>resolve(snapshot);
  tx.onerror=()=>reject(tx.error||Error('保存失败'));
  tx.onabort=()=>reject(tx.error||Error('保存已中止'));
 });
}
export async function listBackups(slot){
 if(!Number.isInteger(slot)||slot<1||slot>SLOT_COUNT)throw Error('无效存档槽位');
 const db=await database();return new Promise((resolve,reject)=>{
  const req=db.transaction('backups','readonly').objectStore('backups').getAll();
  req.onsuccess=()=>resolve(req.result.filter(x=>x.slot===slot&&[`${slot}-1`,`${slot}-2`].includes(x.key)).map(x=>({age:Number(x.key.split('-').at(-1)),updatedAt:x.updatedAt,day:x.data?.day,expeditions:x.data?.expeditions,valid:snapshotValid(x)})).sort((a,b)=>a.age-b.age));
  req.onerror=()=>reject(req.error);
 });
}
export async function restoreBackup(slot,age,validate){
 if(!Number.isInteger(slot)||slot<1||slot>SLOT_COUNT||![1,2].includes(age))throw Error('无效快照槽位');
 const db=await database();const record=await new Promise((resolve,reject)=>{
  const req=db.transaction('backups','readonly').objectStore('backups').get(`${slot}-${age}`);
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
 });
 if(!snapshotValid(record)||!validate(record.data))throw Error('该快照丢失、损坏或格式不兼容');
 // storeSlot preserves the current (if intact) as a rollback snapshot as well.
 return storeSlot(slot,record.data);
}
export async function deleteSlot(slot){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(['saves','backups'],'readwrite');tx.objectStore('saves').delete(slot);tx.objectStore('backups').delete(`${slot}-1`);tx.objectStore('backups').delete(`${slot}-2`);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
export function downloadSave(data,slot){const payload={format:'ashen-vow-save',schemaVersion:1,exportedAt:new Date().toISOString(),slot,data,checksum:snapshotChecksum(data)};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ashen-vow-slot-${slot}-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
export async function readSaveFile(file,validate){if(!file||file.size>2*1024*1024)throw new Error('存档文件过大（最大 2MB）');
 const raw=JSON.parse(await file.text());if(raw?.format!=='ashen-vow-save'||raw.schemaVersion!==1||!validate(raw.data))throw new Error('存档格式无效或版本不受支持');
 if(raw.checksum&&raw.checksum!==snapshotChecksum(raw.data))throw new Error('存档校验码不匹配：内容可能已经损坏');return raw.data;}
