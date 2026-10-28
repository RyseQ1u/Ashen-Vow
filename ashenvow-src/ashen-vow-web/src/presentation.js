// V0.9 presentation-only calculations. This module NEVER mutates game state.
export function battleTelemetry(before,after){
 if(!before||!after)return {effects:[],logs:[],roundChanged:false};
 const previous=[...(before.heroes||[]),...(before.enemies||[])];
 const current=[...(after.heroes||[]),...(after.enemies||[])];
 const byId=new Map(previous.map(unit=>[unit.id,unit]));
 const effects=[];
 for(const unit of current){
  const old=byId.get(unit.id);
  if(!old){effects.push({id:unit.id,kind:'summon',value:0});continue;}
  const amount=(old.hp??0)-(unit.hp??0);
  if(amount>0)effects.push({id:unit.id,kind:unit.hp<=0?'death':'damage',value:amount});
  if(amount<0)effects.push({id:unit.id,kind:'heal',value:-amount});
  const stress=(unit.stress??0)-(old.stress??0);
  if(stress>0)effects.push({id:unit.id,kind:'stress',value:stress});
  if(stress<0)effects.push({id:unit.id,kind:'calm',value:-stress});
  for(const key of ['poison','bleed','stun','mark','weak','guard']){
   if((unit.statuses?.[key]||0)>(old.statuses?.[key]||0))effects.push({id:unit.id,kind:'status',status:key,value:unit.statuses[key]});
  }
 }
 const oldLog=before.logs||[],nextLog=after.logs||[];
 const index=nextLog.findIndex(entry=>oldLog.length&&entry.text===oldLog[0]?.text&&entry.type===oldLog[0]?.type);
 // Log entries are prepended by the engine. A log window is bounded to 24 entries.
 const logs=index<0?nextLog.slice(0,6):nextLog.slice(0,index);
 return {effects,logs,roundChanged:before.round!==after.round,critical:logs.some(l=>l.text?.includes('暴击')),
  victory:after.finished===true};
}
export function eventPresentation(event,region='crypt'){
 const title=String(event?.title||'');
 const motif=/商队|交易|流亡/.test(title)?'caravan':/祭坛|祷|占兆|预言/.test(title)?'oracle':/伏击|回廊|陷阱/.test(title)?'ambush':/宝|秘库|遗物|铁箱/.test(title)?'cache':/休息|篝火|补给/.test(title)?'rest':'unknown';
 const glyph={caravan:'♜',oracle:'◉',ambush:'⚔',cache:'✥',rest:'♨',unknown:'✧'}[motif];
 const kicker={caravan:'TRAVELERS IN THE DARK',oracle:'A WHISPER OF FATE',ambush:'DANGER IN THE SHADOW',cache:'RELICS OF THE LOST',rest:'THE LAST SANCTUARY',unknown:'A CHOICE IN THE DARK'}[motif];
 return {motif,glyph,kicker,region:['crypt','mire','forge'].includes(region)?region:'crypt'};
}
export function cueForTelemetry(telemetry){
 if(telemetry.victory)return 'victory';
 if(telemetry.critical)return 'crit';
 if(telemetry.effects.some(x=>x.kind==='damage'||x.kind==='death'))return 'hit';
 if(telemetry.effects.some(x=>x.kind==='heal'||x.kind==='calm'))return 'heal';
 if(telemetry.effects.some(x=>x.kind==='status'||x.kind==='stress'))return 'event';
 return 'tap';
}
