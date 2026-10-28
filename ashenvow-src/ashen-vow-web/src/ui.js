import {VERSION,CLASSES,SKILLS,ENEMIES,freshGame,heroStats,beginExpedition,reachableNodes,enterNode,resolveEvent,currentActor,validTargets,performSkill,useBandage,retreat,backToCamp,healAtCamp,upgradeHero,forgeGear,moveHero,buySupplies,isValidSave,skipTurn,clamp,ensureProgression,MAX_RESERVES,hireRecruit,swapHero,dismissReserve,equipTrinket,unequipTrinket,salvageTrinket,trinketName,trinketMods,TRINKET_BASES,MOD_LABELS,RARITY_NAMES,ownedTrinketIds,BUILDINGS,MAX_BUILDING_LEVEL,EXPEDITION_PLANS,TALENTS,buildingLevel,buildingCost,upgradeBuilding,campHealCost,campPrayerCost,prayAtCamp,selectExpeditionPlan,allocateTalent,REGIONS,ELITE_TRAITS,selectRegion,regionOf,DIFFICULTIES,selectDifficulty,TRAITS,CRISES,MAX_SKILL_LEVEL,skillTrainingCost,skillLevel,trainSkill,SKILL_BRANCHES,skillBranch,chooseSkillBranch,TRINKET_SETS,activeTrinketSet,enemyResistances,quirkTreatmentCost,treatNegativeTrait,regionThreatLevel,enemyIntent,expeditionSummary,ACHIEVEMENTS,unlockAchievements,basicAttack,endTurn,SKILL_CATEGORY_LABELS,nodePreview,usePotion,useSigil,teamPower,SUPPLY_META,MAX_SUPPLIES} from './engine.js';
import {SLOT_COUNT,allSlots,getSlot,storeSlot,deleteSlot,downloadSave,readSaveFile,listBackups,restoreBackup,snapshotValid} from './storage.js';
import {battleTelemetry,eventPresentation,cueForTelemetry} from './presentation.js';

const root=document.getElementById('app');
const preferences={getItem(key){try{return window.localStorage.getItem(key)}catch{return null}},setItem(key,value){try{window.localStorage.setItem(key,value)}catch{}}};
let game=null,slot=1,view='menu',campSection='camp',mapSelectedNode=null,chosenSkill=null,toastId=0,saveQueue=Promise.resolve(),saveStatus='未载入',cachedSlots=[],importTarget=1,waiting=false,inspectUnitId=null,campTab='team',chosenActiveHero=null,chosenEquipHero=null,codexTab='heroes',cachedBackups={};
let settings={sound:preferences.getItem('av-sound')==='on',lowMotion:preferences.getItem('av-motion')==='low',largeText:preferences.getItem('av-large-text')==='on',shortLogs:preferences.getItem('av-short-logs')==='on',volume:Math.max(0,Math.min(100,Number(preferences.getItem('av-volume')??65)||0)),music:preferences.getItem('av-music')==='on',pace:['slow','normal','fast'].includes(preferences.getItem('av-pace'))?preferences.getItem('av-pace'):'normal'};
const reducedMotion=()=>settings.lowMotion||Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const fxTimers=new Set();
function scheduleFx(callback,delay){const id=setTimeout(()=>{fxTimers.delete(id);callback()},delay);fxTimers.add(id);return id;}
function clearFx(){for(const timer of fxTimers)clearTimeout(timer);fxTimers.clear();}
function effectDuration(){return reducedMotion()?0:settings.pace==='fast'?470:settings.pace==='slow'?1250:850;}
function htmlEscapeAttribute(value){return ESC(value);}

const ESC=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const ICONS={camp:'⌂',map:'◇',battle:'⚔',event:'✧',result:'✦',saves:'▤',settings:'⚙'};
const TYPE_NAMES={battle:'遭遇战',elite:'精英战',boss:'噬誓者',event:'未知事件',treasure:'战利品',rest:'篝火',supply:'补给箱',shrine:'灰火祭坛',ambush:'伏击回廊',cache:'遗物秘库',oracle:'占兆祭坛',caravan:'流亡商队'};
const TYPE_ICON={battle:'⚔',elite:'✷',boss:'♛',event:'?',treasure:'◆',rest:'♨',supply:'✚',shrine:'✥',ambush:'⚡',cache:'▣',oracle:'◉',caravan:'♜'};
function announce(text,error=false){const el=document.getElementById('toast');if(!el)return;el.textContent=text;el.classList.add('visible');el.classList.toggle('danger',error);const thisId=++toastId;setTimeout(()=>{if(toastId===thisId)el.classList.remove('visible')},2800);}
let audioContext=null;
function sound(kind='tap'){
 if(!settings.sound)return;
 try{
  const AudioAPI=window.AudioContext||window.webkitAudioContext;
  if(!AudioAPI)return;
  audioContext??=new AudioAPI();if(audioContext.state==='suspended')audioContext.resume();
  const t=audioContext.currentTime;
  const specs={tap:[520,360,.045,.085,'sine'],hit:[150,58,.12,.24,'sawtooth'],heal:[430,760,.06,.28,'sine'],crit:[210,64,.16,.42,'triangle'],victory:[490,980,.07,.48,'sine'],event:[390,250,.04,.25,'triangle']};
  const [from,to,baseVolume,duration,wave]=specs[kind]||specs.tap;const volume=baseVolume*(settings.volume/100);
  const gain=audioContext.createGain(),o=audioContext.createOscillator();o.type=wave;
  o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);
  if(volume<=0)return;gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(gain);gain.connect(audioContext.destination);o.start(t);o.stop(t+duration+.015);
  o.onended=()=>{o.disconnect();gain.disconnect()};
 }catch(error){console.debug('音频不可用',error)}
}
/** Phase 5: lightweight WebAudio ambient pad (no external files). */
let bgmNodes=null;
function startBgm(){
 if(!settings.sound||!settings.music||bgmNodes||reducedMotion()&&false)return;
 try{
  const AudioAPI=window.AudioContext||window.webkitAudioContext;if(!AudioAPI)return;
  audioContext??=new AudioAPI();if(audioContext.state==='suspended')audioContext.resume();
  const master=audioContext.createGain();master.gain.value=0;master.connect(audioContext.destination);
  const freqs=[55,82.4,110,164.8];const oscs=[];
  for(let i=0;i<freqs.length;i++){
   const o=audioContext.createOscillator(),g=audioContext.createGain();
   o.type=i%2?'triangle':'sine';o.frequency.value=freqs[i];
   g.gain.value=0.045/(i+1);
   const lfo=audioContext.createOscillator(),lg=audioContext.createGain();
   lfo.frequency.value=0.05+i*0.033;lg.gain.value=0.02/(i+1);
   lfo.connect(lg);lg.connect(g.gain);lfo.start();
   o.connect(g);g.connect(master);o.start();
   oscs.push(o,lfo);
  }
  const vol=(settings.volume/100)*0.22;
  master.gain.linearRampToValueAtTime(Math.max(0.0001,vol),audioContext.currentTime+2.2);
  bgmNodes={master,oscs};
 }catch(error){console.debug('BGM 不可用',error)}
}
function stopBgm(){
 if(!bgmNodes)return;
 try{const t=audioContext.currentTime;bgmNodes.master.gain.cancelScheduledValues(t);bgmNodes.master.gain.setValueAtTime(bgmNodes.master.gain.value,t);bgmNodes.master.gain.linearRampToValueAtTime(0.0001,t+0.6);const nodes=bgmNodes;setTimeout(()=>{for(const o of nodes.oscs){try{o.stop();o.disconnect()}catch{}}},700);}catch{}
 bgmNodes=null;
}
function syncBgm(){if(settings.sound&&settings.music)startBgm();else stopBgm();}
function battleSnapshot(){if(!game?.battle)return null;const b=game.battle;return {phase:game.phase,round:b.round,finished:b.finished,heroes:b.heroes.map(u=>({id:u.id,hp:u.hp,stress:u.stress,statuses:{...u.statuses}})),enemies:b.enemies.map(u=>({id:u.id,hp:u.hp,stress:u.stress,statuses:{...u.statuses}})),logs:b.logs.map(l=>({...l}))};}
function addCombatFx(container,className,text,duration){
 if(!container||reducedMotion())return;
 const node=document.createElement('span');node.className=className;node.textContent=text;container.appendChild(node);
 scheduleFx(()=>{node.remove();},duration);
}
function visualImpact(previous,skillId=null){
 if(!previous)return;
 if(game.phase!=='battle'||!game.battle){
  if(game.phase==='map'||game.phase==='result')sound(game.result?.reason==='defeat'?'hit':'victory');return;
 }
 const summary=battleTelemetry(previous,battleSnapshot());
 sound(cueForTelemetry(summary));
 if(reducedMotion())return;
 const duration=effectDuration(),arena=document.querySelector('.combat-arena');
 if(arena){
  arena.classList.add(summary.critical?'cinematic-crit':'cinematic-impact');
  scheduleFx(()=>arena.classList.remove('cinematic-crit','cinematic-impact'),duration);
 }
 if(skillId){
  const skill=SKILLS[skillId];if(skill){
   const stage=document.querySelector('.battle-view');
   addCombatFx(stage,'combat-cast-banner',`${skill.icon}  ${skill.name}`,duration);
  }
 }
 const label={poison:'☠ 中毒',bleed:'✣ 流血',stun:'✷ 眩晕',mark:'◎ 标记',weak:'☽ 虚弱',guard:'⬡ 守护'};
 for(const effect of summary.effects){
  const unit=[...document.querySelectorAll('.combat-unit')].find(x=>x.dataset.id===effect.id);
  if(!unit)continue;
  let text='',style='';
  if(effect.kind==='damage'||effect.kind==='death'){text=`−${effect.value}`;style=`floating-damage damage${summary.critical?' critical':''}`;unit.classList.add('impact-hit');}
  else if(effect.kind==='heal'){text=`+${effect.value}`;style='floating-damage healing';unit.classList.add('impact-heal');}
  else if(effect.kind==='stress'){text=`压力 +${effect.value}`;style='floating-damage floating-stress';}
  else if(effect.kind==='calm'){text=`压力 −${effect.value}`;style='floating-damage floating-calm';}
  else if(effect.kind==='status'){text=label[effect.status]||effect.status;style='floating-damage floating-status';}
  else if(effect.kind==='summon'){text='增援！';style='floating-damage floating-summon';}
  if(text)addCombatFx(unit,style,text,duration);
  scheduleFx(()=>unit.classList.remove('impact-hit','impact-heal'),duration);
 }
 const strip=document.querySelector('.combat-action-report');
 if(strip&&summary.logs.length){strip.textContent=summary.logs[0].text;strip.classList.add('recent');scheduleFx(()=>strip.classList.remove('recent'),duration);}
}
function commitBattleAction(change,skillId=null){const before=battleSnapshot();const result=change();if(result===false||result?.ok===false)return result;
 chosenSkill=null;playSave();render();visualImpact(before,skillId);return result;
}
function stamp(str){try{return new Date(str).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}catch{return '--'}}
function percent(v,max){return clamp(Math.round(v/Math.max(1,max)*100),0,100)}
function phaseView(){return game?.phase||'menu'}
function uiNavigate(next){view=next;inspectUnitId=null;render();}
async function reloadSlots(){try{cachedSlots=await allSlots();cachedBackups={};for(let i=1;i<=SLOT_COUNT;i++)cachedBackups[i]=await listBackups(i);}catch(e){announce(`存档读取失败：${e.message}`,true)}}
function slotRecord(id){return cachedSlots.find(x=>x.slot===id)}
function playSave(){if(!game)return;const localSlot=slot;const snapshot=structuredClone(game);saveStatus='正在保存';renderSaveStatus();saveQueue=saveQueue.catch(()=>{}).then(async()=>{await storeSlot(localSlot,snapshot);saveStatus='已自动保存';renderSaveStatus();}).catch(e=>{saveStatus='保存失败';renderSaveStatus();announce(`保存失败：${e.message}`,true);});}
function renderSaveStatus(){const el=document.querySelector('#save-text');if(el)el.textContent=saveStatus;}
function mutate(fn){if(!game)return;try{const res=fn();if(res===false){announce('当前操作不可执行',true);return;}chosenSkill=null;const unlocked=unlockAchievements(game);playSave();render();if(unlocked.length)announce(`成就解锁：${ACHIEVEMENTS[unlocked[0]].name}`);return res;}catch(e){console.error(e);announce(`操作失败：${e.message}`,true)}}
async function startNew(id){await saveQueue.catch(()=>{});const old=slotRecord(id);if(old&&!window.confirm(`存档 ${id} 已有进度，确定覆盖并开始新游戏吗？`))return;slot=id;game=freshGame();view='guide';chosenSkill=null;inspectUnitId=null;playSave();render();announce(`第 ${id} 个存档已创建`);}
async function load(id){await saveQueue.catch(()=>{});try{const loaded=await getSlot(id);if(!loaded){announce('该存档为空',true);return;}if(!isValidSave(loaded)){announce('存档内容不兼容或已损坏',true);return;}game=ensureProgression(loaded);slot=id;view='game';chosenSkill=null;inspectUnitId=null;saveStatus='读取成功';render();}catch(e){announce(`读取失败：${e.message}`,true)}}
function svgPortrait(type,enemy=false,big=false){const classKey=enemy?'enemy-'+type:type;const info=enemy?ENEMIES[type]:CLASSES[type];const col=info?.color||'#9b9385';const glows=enemy?'#c75d49':'#e8ae63';
 const sigils={warden:'M56 132 L90 96 L124 132 L114 178 L90 196 L66 178 Z',ranger:'M57 147 Q90 95 123 147 L117 192 H63 Z',medic:'M66 130 Q90 99 114 130 L127 199 H53 Z',occult:'M66 112 L90 85 L114 112 L132 209 H48 Z',duelist:'M55 130L83 95L126 135L120 211H60Z',penitent:'M62 127L87 99L119 130L137 215H45Z'};
 const weapon=enemy?`<path d="M44 88 Q18 137 31 189" stroke="${col}" stroke-width="5" fill="none"/>`:
 type==='warden'?`<path d="M136 70 L150 196" stroke="#a2a4a2" stroke-width="6"/><path d="M121 101 L160 96" stroke="#c9b48f" stroke-width="8"/>`:
 type==='ranger'?`<path d="M135 73 Q169 140 135 211" stroke="#c9b48f" stroke-width="5" fill="none"/><path d="M135 73 L135 211" stroke="#d5c3a3" stroke-width="1.5"/>`:
 type==='medic'?`<path d="M144 77 L139 207" stroke="#d7c7a7" stroke-width="4"/><circle cx="145" cy="67" r="10" fill="none" stroke="#c8a6ac" stroke-width="4"/>`:type==='duelist'?`<path d="M139 65L161 191M124 111L162 98" stroke="#b5b8df" stroke-width="5"/>`:type==='penitent'?`<path d="M142 82Q166 122 153 192M133 111l22 7" fill="none" stroke="#c58e79" stroke-width="5"/>`:
 `<path d="M145 94 L145 201" stroke="#b6a7cc" stroke-width="4"/><path d="M134 88 L144 59 L157 87 Z" fill="#e8a56f"/>`;
 const outfit=enemy?'M60 112 L90 91 L120 112 L141 219 H40 Z':sigils[type];
 const headY=enemy&&type==='boss'?72:89;
 const details=enemy?({
  thrall:'<path d="M57 140Q24 159 30 215M123 140Q158 170 148 217" stroke="#9fa48a" stroke-width="8" fill="none" opacity=".76"/><path d="M40 167L54 190L38 212" stroke="#6b6e65" stroke-width="4" fill="none"/>',
  ghoul:'<path d="M55 115Q18 100 17 157L43 197M125 112Q164 104 168 162L141 210" fill="none" stroke="#ada491" stroke-width="11"/><path d="M18 155l-5 26 12-17 11 21 3-23M168 162l10 28-16-19-10 20-8-22" fill="#a99e8e"/>',
  cultist:'<path d="M62 61L89 18 119 61 115 108H64Z" fill="#382b3a" stroke="#ad7b96" stroke-width="4"/><path d="M70 164l20-29 20 29-20 27Z" fill="none" stroke="#c39aa9" stroke-width="4"/><path d="M71 74h38" stroke="#b36f83" stroke-width="3"/>',
  guardian:'<path d="M58 80L57 61 89 37 120 61 122 80 102 101H77Z" fill="#48505c" stroke="#a5aab4" stroke-width="4"/><path d="M45 116H133V147H45Z" fill="#5b626f" stroke="#a4abb4" stroke-width="2"/><path d="M88 120v63m-24-38h49" stroke="#a7aaaf" stroke-width="6"/>',
  wraith:'<path d="M48 179Q27 211 43 236L69 220 90 239 113 218 145 238 130 189" fill="#687e8a" opacity=".56" stroke="#abd7d8" stroke-width="3"/><path d="M65 104Q89 75 115 104" stroke="#9fdbe1" stroke-width="5" opacity=".8" fill="none"/>',
  alchemist:'<path d="M67 75L60 123 88 137 116 122 110 74Z" fill="#343e3b" stroke="#a3b698" stroke-width="4"/><circle cx="78" cy="103" r="8" fill="#c7d68a" opacity=".7"/><circle cx="103" cy="103" r="8" fill="#c7d68a" opacity=".7"/><path d="M92 112L92 131" stroke="#b5ce9d" stroke-width="4"/><circle cx="146" cy="177" r="14" fill="#8cb67a" opacity=".6"/>',
  bonearcher:'<path d="M137 85Q161 148 137 204M137 85V204" stroke="#d2c3ad" stroke-width="4" fill="none"/><path d="M63 77v35m30-34v35m26-35v35" stroke="#d8c3a8" stroke-width="5"/>',
  banshee:'<path d="M55 105Q19 175 39 225L63 208L89 233L121 207L145 231" fill="none" stroke="#b6c9e7" stroke-width="6" opacity=".7"/>',
  butcher:'<path d="M46 133L135 141L137 186H45Z" fill="#703c40" stroke="#be8480" stroke-width="5"/><path d="M140 62L156 190" stroke="#acaca8" stroke-width="9"/>',
  herald:'<path d="M64 61L90 18L117 61L115 103H64Z" fill="#393145" stroke="#b6a0c8" stroke-width="4"/><path d="M47 160Q90 147 134 160" stroke="#ac92c6" stroke-width="6" fill="none"/>',
  mireling:'<path d="M47 68Q90 24 133 68M39 159Q23 113 48 93M143 160Q165 113 133 92" fill="none" stroke="#a1c78d" stroke-width="8" opacity=".7"/>',
  sporewitch:'<path d="M43 76Q90 18 139 76L133 99H48Z" fill="#476143" stroke="#bdca90" stroke-width="5"/><circle cx="35" cy="59" r="9" fill="#a1c482"/><circle cx="139" cy="50" r="7" fill="#a3c991"/>',
  bogstalker:'<path d="M54 86L35 30L79 64M108 66L145 28L127 101" fill="#546947" stroke="#b4c78d" stroke-width="5"/><path d="M49 176L20 203M134 176L159 209" stroke="#aec898" stroke-width="8"/>',
  leech:'<path d="M46 110Q0 150 45 206Q90 241 133 196Q170 137 126 110" fill="none" stroke="#967c68" stroke-width="13"/><circle cx="95" cy="148" r="23" fill="#42382f" stroke="#bca387" stroke-width="5"/>',
  bogcolossus:'<path d="M39 85L19 65 53 22 79 54M140 82L163 60 128 20 108 55" fill="none" stroke="#778b61" stroke-width="14"/><path d="M49 155L25 227M132 155L153 222" fill="none" stroke="#8eaa74" stroke-width="18"/>',
  mirequeen:'<path d="M42 88L18 48 63 58 90 14 119 56 161 46 137 89" fill="#45553b" stroke="#c2d98f" stroke-width="6"/><circle cx="90" cy="148" r="24" fill="none" stroke="#a5df8e" stroke-width="5"/><path d="M90 130l14 18-14 20-14-20Z" fill="#98c681"/>',
  emberguard:'<path d="M57 84L50 44 90 26 130 44 123 84" fill="#473c36" stroke="#efac69" stroke-width="6"/><path d="M54 135H126L121 157H59Z" fill="#8d5545" stroke="#efaa79" stroke-width="5"/>',
  slagbeast:'<path d="M47 92L19 31 72 68M108 68L158 24 139 96" fill="#75483b" stroke="#f2a468" stroke-width="8"/><path d="M38 165l-22 35m118-35 26 34" stroke="#db7952" stroke-width="13"/>',
  cinderseer:'<circle cx="89" cy="73" r="34" fill="none" stroke="#ed985d" stroke-width="5"/><path d="M53 73H126M90 37v72" stroke="#f5c18b" stroke-width="4"/><circle cx="90" cy="73" r="10" fill="#ffb96a"/>',
  smelter:'<path d="M136 35L159 57 140 183" fill="none" stroke="#a6a19b" stroke-width="12"/><path d="M122 36H168V69H122Z" fill="#ba8170" stroke="#f3c293" stroke-width="4"/>',
  ironreaver:'<path d="M48 69L69 21 89 55 114 18 142 72" fill="none" stroke="#eba06d" stroke-width="11"/><path d="M139 34L173 69L150 106L116 73Z" fill="#79726e" stroke="#eea478" stroke-width="5"/>',
  forgeheart:'<path d="M90 9L126 55 153 19 155 112 125 120 141 213 90 189 38 214 52 120 24 112 28 23 54 55Z" fill="none" stroke="#ec9660" stroke-width="9"/><circle cx="90" cy="139" r="27" fill="#bd592a" stroke="#ffd1a0" stroke-width="6"/><path d="M90 116l18 21-18 29-18-29Z" fill="#f3be79"/>',
  boss:'<path d="M51 86Q34 124 43 195L30 221M128 86Q145 124 137 195L150 221" fill="none" stroke="#bd8963" stroke-width="12"/><circle cx="90" cy="145" r="21" fill="none" stroke="#ecc291" stroke-width="4"/><path d="M90 128l7 16-7 17-7-17Z" fill="#e9aa72"/>'
 })[type]||'':({
  warden:'<path d="M61 72L90 41 120 72 112 106H67Z" fill="#716755" stroke="#d6bb8f" stroke-width="4"/><path d="M90 52V101M76 83h28" stroke="#e2c78e" stroke-width="4"/><path d="M66 140h48l-23 42Z" fill="#c4a873" opacity=".72"/>',
  ranger:'<path d="M58 92L74 45 90 56 103 45 122 94" fill="#273e3e" stroke="#95b6ae" stroke-width="4"/><path d="M60 140Q90 160 120 140" stroke="#b2ccbb" stroke-width="3" fill="none"/><path d="M90 119L101 141 90 163 79 141Z" fill="#9cae9f"/>',
  medic:'<path d="M66 65L90 36 115 65 113 103H66Z" fill="#56454b" stroke="#c4a3a9" stroke-width="4"/><path d="M90 40V77M74 59h32" stroke="#deb8bf" stroke-width="5"/><path d="M71 140h38v38H71Z" fill="#8e626b"/><path d="M90 147v25m-12-12h24" stroke="#e6d0c8" stroke-width="5"/>',
  occult:'<path d="M60 100L89 29 120 100 114 114H66Z" fill="#45394f" stroke="#b29acb" stroke-width="4"/><path d="M72 147Q90 128 108 147L91 189Z" fill="none" stroke="#d5b2e5" stroke-width="4"/><circle cx="91" cy="157" r="8" fill="#e3a36f"/>',
  duelist:'<path d="M56 80L72 42L104 49L119 83" fill="#34334b" stroke="#a9a9cf" stroke-width="4"/><path d="M56 143L130 188" stroke="#bec0e4" stroke-width="4"/>',
  penitent:'<path d="M63 75L90 34L118 75" fill="none" stroke="#d4ad9a" stroke-width="5"/><path d="M55 147L128 189M128 147L55 189" stroke="#a86865" stroke-width="6"/>'
 })[type]||'';
 return `<svg class="figure-svg ${big?'big':''}" viewBox="0 0 180 245" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g-${classKey}" cx="50%" cy="36%" r="60%"><stop offset="0" stop-color="${glows}" stop-opacity=".28"/><stop offset="1" stop-color="${glows}" stop-opacity="0"/></radialGradient><linearGradient id="cloth-${classKey}" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${col}" stop-opacity=".77"/><stop offset="1" stop-color="#0e1015"/></linearGradient></defs><ellipse cx="91" cy="223" rx="66" ry="9" fill="#000" opacity=".43"/><ellipse cx="90" cy="127" rx="83" ry="108" fill="url(#g-${classKey})"/>${weapon}<path d="${outfit}" fill="url(#cloth-${classKey})" stroke="${col}" stroke-width="2" stroke-opacity=".65"/><path d="M63 139 L46 191 L64 197 L83 149 M117 139 L134 191 L116 197 L99 149" fill="#15171d" stroke="${col}" stroke-opacity=".5" stroke-width="2"/><path d="M62 ${headY} Q62 ${headY-46} 90 ${headY-48} Q118 ${headY-46} 118 ${headY} L106 ${headY+28} L74 ${headY+28} Z" fill="#181920" stroke="${col}" stroke-opacity=".7" stroke-width="3"/><path d="M76 ${headY-10} Q90 ${headY-3} 104 ${headY-10}" stroke="${glows}" opacity=".7" stroke-width="2" fill="none"/><path d="M78 ${headY+6} L84 ${headY+5} M96 ${headY+5} L102 ${headY+6}" stroke="${glows}" stroke-width="2.8" stroke-linecap="round"/><path d="M90 ${headY+30} L90 184" stroke="${col}" stroke-width="2" stroke-opacity=".3"/>${enemy&&type==='boss'?'<path d="M50 60 L43 24 L70 49 L90 14 L110 49 L137 24 L130 60" stroke="#c99d6e" stroke-width="5" fill="none"/>':''}${details}</svg>`;
}
function healthBar(u,enemy=false){const hp=Math.max(0,u.hp), stress=clamp(u.stress||0,0,120);return `<div class="vitals"><div class="barline"><span class="bar-caption">生命</span><div class="bar-track"><div class="bar-fill blood" style="width:${percent(hp,u.maxHp)}%"></div></div><span class="bar-numbers">${hp}/${u.maxHp}</span></div>${!enemy?`<div class="barline"><span class="bar-caption">压力</span><div class="bar-track"><div class="bar-fill stress" style="width:${percent(stress,100)}%"></div></div><span class="bar-numbers">${stress}/100</span></div>`:''}</div>`}
function label(name,sub){return `<div class="section-heading"><span class="rule"></span><span class="eyebrow">${ESC(sub)}</span><h2>${ESC(name)}</h2></div>`}
function button(text,action='',attrs='',className='btn'){return `<button class="${className}" ${action?`data-action="${action}"`:''} ${attrs}>${text}</button>`}
function hud(){return `<header class="topbar"><div class="brand" data-action="nav-menu" role="button" tabindex="0"><div class="brand-mark">✧</div><div><div class="brand-title">灰烬誓约<span> · ASHEN VOW</span></div><div class="brand-sub">THE LAST FLAME ENDURES</div></div></div><nav class="nav-tabs"><button data-action="nav-game" class="nav-tab ${view==='game'?'selected':''}" ${!game?'disabled':''}>${ICONS[game?.phase||'camp']} ${game?.phase==='battle'?'战斗中':game?.phase==='map'?'地牢地图':game?.phase==='event'?'遭遇事件':'营地'}</button><button data-action="nav-saves" class="nav-tab ${view==='saves'?'selected':''}">▤ 存档</button><button data-action="nav-guide" class="nav-tab ${view==='guide'?'selected':''}">? 指南</button><button data-action="nav-codex" class="nav-tab ${view==='codex'?'selected':''}">✥ 图鉴</button><button data-action="nav-settings" class="nav-tab ${view==='settings'?'selected':''}">⚙ 设置</button></nav><div class="resource-bar">${game?`<span title="金币">◈ <strong>${game.gold}</strong></span><span title="遗物碎片">✥ <strong>${game.shards}</strong></span><span class="date-line">第 ${game.day} 日</span>`:'<span class="date-line">单机 · 离线</span>'}</div></header>`}
function playerLevel(saved){
 if(!saved)return 1;
 return 1+Math.floor((saved.expeditions||0)*2+(saved.day||1)/3+Object.keys(saved.achievements||{}).length*3);
}
function homePage(){
 const saved=game||slotRecord(slot)?.data||null;
 const lvl=playerLevel(saved&&isValidSave(saved)?saved:null);
 const days=saved?.day||0,expeditions=saved?.expeditions||0,achv=saved?Object.keys(saved.achievements||{}).length:0;
 const heroCount=saved?.heroes?.length||0;
 return `<section class="landing">
  <div class="landing-art"><div class="moon"></div><div class="mountain back"></div><div class="mountain front"></div><div class="tower tower-one"></div><div class="tower tower-two"></div><div class="tower tower-three"></div><div class="embers"></div></div>
  <div class="landing-shell">
   <header class="landing-top">
    <div class="brand landing-brand"><div class="brand-mark">✧</div><div><div class="brand-title">灰烬誓约<span> · ASHEN VOW</span></div><div class="brand-sub">THE LAST FLAME ENDURES</div></div></div>
    <div class="landing-profile" aria-label="玩家档案">
     <div class="profile-orb">${lvl}</div>
     <div class="profile-copy"><b>夜烬旅者</b><small>档案等级 Lv.${lvl} · ${heroCount ? heroCount+' 名英雄' : '尚未启程'}</small></div>
    </div>
   </header>
   <div class="landing-inner">
    <div class="eyebrow overline">A TALE BURIED IN ASHES</div>
    <div class="ornament">✦ ─── ❖ ─── ✦</div>
    <h1>灰烬<span>誓约</span></h1>
    <p class="landing-en">ASHEN VOW</p>
    <p class="landing-desc">“当最后一盏灯熄灭，<br/>谁会记得我们曾经抵抗过黑暗？”</p>
    <div class="landing-cards">
     <button class="landing-card primary" data-action="${game?'nav-game':'new'}" data-slot="${slot}">
      <span class="landing-card-icon">${game?'▶':'✚'}</span>
      <b>${game?'继续远征':'开始新的誓约'}</b>
      <small>${game?`第 ${game.day} 日 · ${game.phase==='battle'?'战斗中':game.phase==='map'?'地牢深处':'营地整备'}`:'创建角色，点亮第一堆篝火'}</small>
     </button>
     <button class="landing-card" data-action="nav-saves">
      <span class="landing-card-icon">▤</span>
      <b>命运残页</b>
      <small>选择存档 · 导出备份 · 云端之外的记忆</small>
     </button>
     <button class="landing-card" data-action="nav-guide">
      <span class="landing-card-icon">?</span>
      <b>旅者指南</b>
      <small>战斗规则 · 营地建设 · 远征方针</small>
     </button>
     <button class="landing-card" data-action="nav-settings">
      <span class="landing-card-icon">⚙</span>
      <b>设置</b>
      <small>音效 · 动画 · 文字大小 · 节奏</small>
     </button>
    </div>
    <div class="landing-meta">4 名英雄 &nbsp;·&nbsp; 随机远征 &nbsp;·&nbsp; 回合策略 &nbsp;·&nbsp; 本地存档</div>
   </div>
   <aside class="landing-save-card" aria-label="存档概览">
    <div class="save-card-tag">ARCHIVE 0${slot}</div>
    <b>${saved?'残火营地':'空白存档'}</b>
    <p>${saved?`第 ${days} 日 · 远征 ${expeditions} 次 · 成就 ${achv}/12`:'尚未记录任何誓约'}</p>
    <div class="landing-save-actions">
     ${saved&&game?button('进入营地','nav-game','','btn btn-gold btn-tiny'):button('载入此页','load',`data-slot="${slot}"`,'btn btn-gold btn-tiny')}
     ${button('管理存档','nav-saves','','btn btn-ghost btn-tiny')}
    </div>
   </aside>
   <div class="landing-foot"><span>WEB EDITION · V${VERSION}.0</span><span>独立原创游戏 · 不依赖服务器</span></div>
  </div>
 </section>`;
}
function heroCard(hero,options={}){const type=CLASSES[hero.classId],stats=heroStats(hero,game);const isCamp=options.camp;return `<article class="hero-card"><div class="hero-portrait" style="--accent:${type.color}"><div class="frame-top">✧ <span>LV. ${hero.level}</span> ✧</div>${svgPortrait(hero.classId)}<div class="frame-foot">${type.title}</div></div><div class="hero-info"><div class="hero-name">${ESC(hero.name)} ${hero.afflicted?`<span class="affliction" title="${ESC(CRISES[hero.crisis]?.desc||'精神创伤')}">${ESC(CRISES[hero.crisis]?.name||'精神崩溃')}</span>`:''}</div><div class="hero-class">${type.name} · 位置 ${hero.rank}</div>${healthBar(hero)}<div class="trait-summary">${(hero.traits||[]).map(id=>`<span class="trait-tag ${TRAITS[id]?.kind||''}" title="${ESC(TRAITS[id]?.desc||'')}">${TRAITS[id]?.kind==='positive'?'✦':'☽'} ${ESC(TRAITS[id]?.name||id)}</span>`).join('')}${hero.crisis?`<span class="trait-tag negative">⚡ ${ESC(CRISES[hero.crisis]?.name||'崩溃')}</span>`:''}</div>${isCamp?`<div class="formation-controls"><span>前排 ← 站位 → 后排</span><div>${button('◀','move',`data-id="${hero.id}" data-direction="-1" ${hero.rank===1?'disabled':''}`,'btn btn-tiny btn-ghost')}${button('▶','move',`data-id="${hero.id}" data-direction="1" ${hero.rank===4?'disabled':''}`,'btn btn-tiny btn-ghost')}</div></div><div class="gear-mini"><span>✦ 天赋点 ${hero.talentPoints||0}</span><span>⚔ 武器 +${hero.gear?.weapon||0}</span><span>⬡ 护甲 +${hero.gear?.armor||0}</span></div><div class="trinket-mini">${(hero.trinkets||[null,null]).map(itemId=>{const item=game.items?.find(i=>i.id===itemId);return `<span title="${ESC(item?trinketName(item):'空饰品槽')}">${item?'✥ '+ESC(trinketName(item)):'◇ 空饰品槽'}</span>`}).join('')}</div><div class="hero-actions">${button(`疗伤 · ${campHealCost(game)} ◈`,'heal',`data-id="${hero.id}" ${game.gold<campHealCost(game)||(hero.hp===hero.maxHp&&hero.stress===0)?'disabled':''}`,'btn btn-small btn-ghost')}${button(`祷告 · ${campPrayerCost(game)} ◈`,'pray',`data-id="${hero.id}" ${game.gold<campPrayerCost(game)||hero.stress<=0?'disabled':''}`,'btn btn-small btn-ghost')}${button('训练 · 30 ◈ / 5 ✥','upgrade',`data-id="${hero.id}" ${game.gold<30||game.shards<5||hero.level>=5?'disabled':''}`,'btn btn-small btn-ghost')}${['weapon','armor'].map(kind=>{const lv=hero.gear?.[kind]||0,gold=Math.max(10,25+lv*20-buildingLevel(game,'workshop')*5),shards=2+lv*2;return button(`${kind==='weapon'?'锻造武器':'铸造护甲'} +${lv} ${lv<3?`· ${gold} ◈/${shards} ✥`:'· 满级'}`,'forge',`data-id="${hero.id}" data-kind="${kind}" ${lv>=3||game.gold<gold||game.shards<shards?'disabled':''}`,'btn btn-small btn-ghost')}).join('')}</div>`:''}</div></article>`;}
function trinketStatsText(item){return Object.entries(trinketMods(item)).map(([k,v])=>`${MOD_LABELS[k]||k} ${v>=0?'+':''}${v}`).join(' · ');}
function journalPage(){const summary=expeditionSummary(game);
 const reason={victory:'凯旋',retreat:'撤退',defeat:'溃败'};
 return `<div class="panel journal-page">${label('远征编年史','EXPEDITION CHRONICLE')}<p class="small-muted">仅统计 V0.8 之后完成的远征。旧存档中的历史胜利次数仍会保留，但不会补造收益数字。</p>
 <div class="journal-overview"><div><small>记录场次</small><strong>${summary.total}</strong></div><div><small>胜利场次</small><strong>${summary.victories}</strong></div><div><small>记录金币</small><strong>${summary.gold}</strong></div><div><small>单次平均金币</small><strong>${summary.averageGold}</strong></div></div>
 <div class="journal-table"><div class="journal-row header"><span>营地日</span><span>地区 · 难度</span><span>结局</span><span>金币 / 碎片</span></div>${summary.reports.length?summary.reports.map(r=>`<div class="journal-row"><span>第 ${r.day} 日</span><span>${ESC(REGIONS[r.region]?.name||r.region)} · ${ESC(DIFFICULTIES[r.difficulty]?.name||r.difficulty)}</span><span>${reason[r.reason]||'结束'}</span><span>◈ ${r.gold} / ✥ ${r.shards}</span></div>`).join(''):'<p class="muted">还没有 V0.8 远征记录。完成远征后可在这里复盘。</p>'}</div>
 <p class="small-muted">连续两次全队溃败且营地资金不足 35 金币时，触发一次紧急救济，避免存档陷入无法继续的经济死局。</p></div>`;
}
function achievementsPage(){
 const unlocked=Object.keys(game.achievements||{}).length;
 return `<div class="panel v10-section">${label('灰烬功勋','ACHIEVEMENTS')}<p class="small-muted">成就只记录游戏内实际进度，不需要账号，也不提供可重复领取的经济奖励。旧存档会按现有进度补记已达成成就。</p><h3>已解锁 ${unlocked} / ${Object.keys(ACHIEVEMENTS).length}</h3><div class="v10-card-grid">${Object.entries(ACHIEVEMENTS).map(([id,a])=>`<article class="v10-card ${game.achievements?.[id]?'obtained':'locked'}"><span class="v10-symbol">${game.achievements?.[id]?'✦':'◇'}</span><h4>${a.name}</h4><p>${a.desc}</p><small>${game.achievements?.[id]?`第 ${game.achievements[id]} 日达成`:'尚未完成'}</small></article>`).join('')}</div></div>`;
}
function guidePage(){
 const steps=[['整备四人小队','在营地治疗英雄，调整 1～4 号位置。近战技能通常需要前排，治疗和远程技能多在后排。'],['选择地区与难度','首次建议：暮影墓窟、巡礼难度、标准远征。先保留金币购买火把和绷带。'],['沿节点探索','点击高亮的相邻节点前进。战斗、事件、宝箱或篝火会改变远征资源。'],['回合制战斗','按照行动顺序操作：点击技能，再点亮可选敌人或队友。注意技能施法站位和目标位置。'],['压力与撤退','生命、压力和物资同等重要。在地图界面可选择撤退，把已经得到的战利品带回营地。'],['存档与备份','所有数据仅在浏览器本地。建议定期在存档管理导出 JSON；删除网站数据后无法仅凭自动快照恢复。']];
 return `<section class="content-view utility-view v10-page"><div class="utility-heading">${label('启程指南','TRAVELER GUIDE')}<p>无需联网的交互说明。首次开局会打开此页面；之后可以通过顶部「指南」随时查看。</p></div><div class="panel v10-section"><div class="v10-card-grid">${steps.map(([t,d],i)=>`<article class="v10-card"><span class="v10-symbol">0${i+1}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div><div class="v10-cta">${game?button('明白了 · 返回游戏','tutorial-done','','btn btn-gold btn-xl'):button('前往存档 · 创建游戏','nav-saves','','btn btn-gold btn-xl')}</div></div></section>`;
}
function codexPage(){
 const tabs=[['heroes','职业'],['skills','技能'],['monsters','敌人'],['regions','地牢'],['equipment','饰品套装']];
 let entries=[];
 if(codexTab==='heroes')entries=Object.entries(CLASSES).map(([id,c])=>[c.icon,c.name,c.lore,`生命 ${c.maxHp} · 攻击 ${c.attack} · 速度 ${c.speed}`]);
 if(codexTab==='skills')entries=Object.entries(SKILLS).map(([id,v])=>[v.icon,v.name,v.desc,`命中 ${v.accuracy}% · 站位 ${v.caster.join('、')}`]);
 if(codexTab==='monsters')entries=Object.entries(ENEMIES).map(([id,e])=>[e.icon,e.name,e.title,`生命 ${e.maxHp} · 攻击 ${e.attack} · 护甲 ${e.armor}`]);
 if(codexTab==='regions')entries=Object.entries(REGIONS).map(([id,v])=>['◇',v.name,v.desc||'前往这一地区探索事件并挑战首领。',`地区首领：${ENEMIES[v.boss?.[0]]?.name||'未知'}`]);
 if(codexTab==='equipment')entries=Object.entries(TRINKET_SETS).map(([id,v])=>['✥',v.name,v.effect,`部件：${v.pieces.map(x=>TRINKET_BASES[x]?.name||x).join(' + ')}`]);
 return `<section class="content-view utility-view v10-page"><div class="utility-heading">${label('灰烬图鉴','THE ASHEN CODEX')}<p>所有职业、技能、怪物与装备资料；内容来自游戏内实际规则，方便查阅与搭配。</p></div><div class="panel v10-section"><div class="v10-tabs">${tabs.map(([id,n])=>button(n,'codex-tab',`data-id="${id}"`,`btn ${id===codexTab?'btn-gold':'btn-ghost'}`)).join('')}</div><div class="v10-card-grid">${entries.map(([icon,title,desc,stat])=>`<article class="v10-card"><span class="v10-symbol">${ESC(icon)}</span><h3>${ESC(title)}</h3><p>${ESC(desc)}</p><small>${ESC(stat)}</small></article>`).join('')}</div></div></section>`;
}
function campTabs(){const list=campSection==='archive'?[['journal','远征记录'],['achievements','成就'],['town','城镇建设']]:[['team','远征队伍'],['roster','英雄招募'],['trinkets','饰品装备'],['talents','英雄天赋'],['skills','技能训练']];return `<div class="camp-tabs" role="tablist">${list.map(([id,lab])=>`<button class="camp-tab ${campTab===id?'active':''}" role="tab" aria-selected="${campTab===id}" data-action="camp-tab" data-id="${id}">${lab}</button>`).join('')}</div>`;}
function rosterPage(){const reserves=game.reserveHeroes||[];const active=chosenActiveHero&&game.heroes.find(h=>h.id===chosenActiveHero)||game.heroes[0];return `<div class="roster-page"><div class="roster-intro"><h3>候选人旅店 <span>THE WAYWARD INN</span></h3><p>每次远征归来刷新招募名单。雇佣费用 65 金币，最多容纳 ${MAX_RESERVES} 名后备英雄。</p></div><div class="recruit-grid">${(game.recruits||[]).length?(game.recruits||[]).map((offer,i)=>`<article class="recruit-card"><div class="recruit-face">${svgPortrait(offer.classId)}</div><div><strong>${ESC(offer.name)}</strong><span>${CLASSES[offer.classId].name}</span><small>${CLASSES[offer.classId].lore}</small></div>${button('雇佣 · 65 ◈','recruit',`data-index="${i}" ${game.gold<65||reserves.length>=MAX_RESERVES?'disabled':''}`,'btn btn-gold btn-full')}</article>`).join(''):'<p class="no-items">本轮没有可招募的旅人，请完成一次远征后再来。</p>'}</div><div class="ornamental-line"></div><h3 class="roster-section-title">后备英雄 <span>${reserves.length} / ${MAX_RESERVES}</span></h3>${reserves.length?`<p class="muted">先选择要替换的出战位置，再点击后备英雄的“替换入队”。</p><div class="active-swaps">${game.heroes.map(h=>button(`${h.rank} · ${ESC(h.name)}`, 'active-choice',`data-id="${h.id}"` ,`btn ${active.id===h.id?'btn-gold':'btn-ghost'}`)).join('')}</div><div class="reserve-grid">${reserves.map(h=>`<div class="reserve-card"><div class="reserve-icon">${CLASSES[h.classId].icon}</div><div><b>${ESC(h.name)}</b><small>${CLASSES[h.classId].name} · Lv.${h.level} · HP ${h.hp}/${h.maxHp}</small></div><div class="reserve-actions">${button('替换入队','swap-hero',`data-id="${h.id}" data-active="${active.id}"`,'btn btn-small btn-gold')}${button('遣散','dismiss',`data-id="${h.id}"`,'btn btn-small btn-ghost')}</div></div>`).join('')}</div>`:'<p class="no-items">暂无后备英雄。先招募一位旅人，再调整出战阵容。</p>'}</div>`;}
function trinketsPage(){const heroes=[...game.heroes,...(game.reserveHeroes||[])],hero=heroes.find(h=>h.id===chosenEquipHero)||heroes[0];const inUse=ownedTrinketIds(game);const available=(game.items||[]).filter(item=>!inUse.has(item.id));return `<div class="trinkets-page"><div class="roster-intro"><h3>遗物收藏 <span>TRINKET VAULT</span></h3><p>战斗和探索有概率发现饰品。精英必掉稀有饰品，首领必掉史诗饰品。每位英雄可装备两件。</p></div><div class="trinket-summary"><span>收藏 <b>${game.items?.length||0}</b></span><span>未装备 <b>${available.length}</b></span><span>已装备 <b>${inUse.size}</b></span></div><div class="trinket-heroes">${heroes.map(h=>button(`${ESC(h.name)} · ${CLASSES[h.classId].name}`, 'equip-hero',`data-id="${h.id}"`,`btn ${hero.id===h.id?'btn-gold':'btn-ghost'}`)).join('')}</div><div class="set-readout">${activeTrinketSet(hero,game)?`<strong>✦ 套装已激活 · ${TRINKET_SETS[activeTrinketSet(hero,game)].name}</strong><span>${TRINKET_SETS[activeTrinketSet(hero,game)].effect}</span>`:`<strong>◇ 未激活饰品套装</strong><span>集齐指定两件基底饰品即可获得额外属性。</span>`}</div><div class="trinket-slots">${[0,1].map(i=>{const item=game.items?.find(t=>t.id===hero.trinkets?.[i]);return `<div class="trinket-slot"><small>饰品槽 ${i+1}</small><strong>${item?ESC(trinketName(item)):'◇ 尚未装备'}</strong><span>${item?trinketStatsText(item):'从下方仓库选择一件饰品'}</span>${item?button('卸下','unequip',`data-id="${hero.id}" data-slot="${i}"`,'btn btn-small btn-ghost'):''}</div>`}).join('')}</div><div class="set-collection"><h4>可收集的双件套</h4><div class="set-collection-grid">${Object.values(TRINKET_SETS).map(set=>`<div class="set-collection-item"><b>${set.name}</b><small>${set.pieces.map(x=>TRINKET_BASES[x].name).join(" + ")}</small><span>${set.effect}</span></div>`).join("")}</div></div><h3 class="roster-section-title">饰品仓库 <span>${available.length} 件可装备</span></h3>${available.length?`<div class="trinket-grid">${available.map(item=>`<article class="trinket-card rarity-${item.rarity}"><div class="trinket-item-top"><span class="trinket-emblem">${TRINKET_BASES[item.baseId].icon}</span><small>${RARITY_NAMES[item.rarity]}</small></div><h4>${ESC(trinketName(item))}</h4><p>${trinketStatsText(item)}</p><div class="trinket-actions">${[0,1].map(i=>button(`装备至槽 ${i+1}`,'equip',`data-id="${item.id}" data-hero="${hero.id}" data-slot="${i}"`,'btn btn-small btn-ghost')).join('')}${button('分解','salvage',`data-id="${item.id}"`,'btn btn-small btn-ghost')}</div></article>`).join('')}</div>`:'<p class="no-items">仓库中没有未装备的饰品。探索宝箱、击败精英与首领可以获取新饰品。</p>'}</div>`;}
function townPage(){return `<div class="town-page">
 <div class="town-head"><div class="eyebrow">REBUILD THE SANCTUARY</div><h3>在废墟上重建家园</h3><p>升级建筑会永久改变之后每次远征和营地管理的效果。所有建设消耗当前存档的金币和遗物碎片。</p></div>
 <div class="town-grid">${Object.entries(BUILDINGS).map(([id,b])=>{const lv=buildingLevel(game,id),cost=buildingCost(game,id),max=lv>=MAX_BUILDING_LEVEL;
 return `<article class="town-card"><div class="town-card-top"><span class="town-icon">${b.icon}</span><div><div class="eyebrow">${b.en}</div><h4>${b.name}</h4></div><span class="town-level">LV ${lv} / ${MAX_BUILDING_LEVEL}</span></div>
 <div class="town-meter">${Array.from({length:MAX_BUILDING_LEVEL},(_,i)=>`<i class="${i<lv?'filled':''}"></i>`).join('')}</div>
 <p>${b.desc}</p><div class="town-bonus">${b.bonus}</div>
 ${button(max?'已经达到最高等级':`升级 · ${cost.gold} ◈ / ${cost.shards} ✥`,'building',`data-id="${id}" ${max||game.gold<cost.gold||game.shards<cost.shards?'disabled':''}`,'btn btn-gold btn-full')}</article>`}).join('')}</div>
 <div class="town-head town-rest"><div class="eyebrow">HEALING & SOLACE</div><h3>伤患照护</h3><p>出战和后备英雄都可以接受治疗和祷告。礼拜堂与医馆升级也会强化归营时后备队的被动恢复。</p></div>
 <div class="town-patients">${[...game.heroes,...game.reserveHeroes].map(h=>`<div class="town-patient"><div><b>${ESC(h.name)}</b><small>${CLASSES[h.classId].name} · ${h.hp}/${h.maxHp} HP · ${h.stress}/100 压力</small></div><div>${button(`疗伤 ${campHealCost(game)} ◈`,'heal',`data-id="${h.id}" ${game.gold<campHealCost(game)||h.hp===h.maxHp&&h.stress===0?'disabled':''}`,'btn btn-small btn-ghost')}${button(`祷告 ${campPrayerCost(game)} ◈`,'pray',`data-id="${h.id}" ${game.gold<campPrayerCost(game)||h.stress<=0?'disabled':''}`,'btn btn-small btn-ghost')}${(h.traits||[]).filter(t=>TRAITS[t]?.kind==='negative').map(t=>{const cost=quirkTreatmentCost(game);return button(`治疗${TRAITS[t].name} · ${cost.gold} ◈/${cost.shards} ✥`,'treat-trait',`data-id="${h.id}" data-kind="${t}" ${game.gold<cost.gold||game.shards<cost.shards?'disabled':''}`,'btn btn-small btn-cure')}).join('')}</div></div>`).join('')}</div>
 </div>`;}
function talentsPage(){const heroes=[...game.heroes,...game.reserveHeroes],hero=heroes.find(h=>h.id===chosenEquipHero)||heroes[0];
 return `<div class="talents-page"><div class="town-head"><div class="eyebrow">HERO GROWTH</div><h3>英雄专精</h3><p>英雄每次升级获得 1 个天赋点。每种天赋最多强化 2 次，永久影响角色属性。后备英雄同样可以使用。</p></div>
 <div class="talent-roster">${heroes.map(h=>button(`${ESC(h.name)} · ${h.talentPoints||0} 点`,'talent-hero',`data-id="${h.id}"`,`btn ${hero.id===h.id?'btn-gold':'btn-ghost'}`)).join('')}</div>
 <div class="talent-hero-heading"><span class="talent-face">${svgPortrait(hero.classId)}</span><div><div class="eyebrow">${CLASSES[hero.classId].title}</div><h4>${ESC(hero.name)} · Lv.${hero.level}</h4><p>剩余天赋点 <strong>${hero.talentPoints||0}</strong> · 攻击 ${heroStats(hero,game).attack} · 最大生命 ${heroStats(hero,game).maxHp}</p></div></div>
 <div class="talent-grid">${Object.entries(TALENTS).map(([id,t])=>{const lv=hero.talents?.[id]||0;return `<article class="talent-card"><span class="talent-symbol">${t.icon}</span><h4>${t.name}</h4><p>${t.desc}</p><div class="talent-ranks">${Array.from({length:t.max},(_,i)=>`<i class="${i<lv?'filled':''}"></i>`).join('')}</div>${button(lv>=t.max?'已满级':`强化 · 1 天赋点`,'talent',`data-id="${hero.id}" data-kind="${id}" ${lv>=t.max||!hero.talentPoints?'disabled':''}`,'btn btn-gold btn-full')}</article>`}).join('')}</div></div>`;}
function skillTrainingPage(){const heroes=[...game.heroes,...game.reserveHeroes],hero=heroes.find(h=>h.id===chosenEquipHero)||heroes[0];
 return `<div class="skills-training-page"><div class="town-head"><div class="eyebrow">BATTLE TECHNIQUES · ADVANCED</div><h3>职业技能训练</h3><p>每个职业的三项技能都能提升两级。技能达到 +1 后，可在两种互斥专精中选择一种。专精直接改变战斗数值；切换专精需要额外花费。</p></div>
 <div class="talent-roster">${heroes.map(h=>button(ESC(h.name),'talent-hero',`data-id="${h.id}"`,`btn ${h.id===hero.id?'btn-gold':'btn-ghost'}`)).join('')}</div>
 <div class="training-summary"><strong>${ESC(hero.name)} · ${CLASSES[hero.classId].name}</strong><span>金币 ◈ ${game.gold} · 碎片 ✥ ${game.shards}</span></div>
 <div class="skill-training-grid">${CLASSES[hero.classId].skills.map(id=>{const sk=SKILLS[id],lv=skillLevel(hero,id),cost=skillTrainingCost(hero,id),max=lv>=MAX_SKILL_LEVEL;
 return `<article class="training-card"><div class="training-icon">${sk.icon}</div><div class="eyebrow">LEVEL ${lv} / ${MAX_SKILL_LEVEL}</div><h4>${sk.name}</h4><p>${sk.desc}</p><div class="training-meter">${Array.from({length:MAX_SKILL_LEVEL},(_,i)=>`<span class="${i<lv?'filled':''}"></span>`).join('')}</div>${button(max?'已满级':`训练 · ${cost.gold} ◈ / ${cost.shards} ✥`,'train-skill',`data-id="${hero.id}" data-kind="${id}" ${max||game.gold<cost.gold||game.shards<cost.shards?'disabled':''}`,'btn btn-gold btn-full')}<div class="branch-chooser"><div class="eyebrow">SKILL BRANCH · 技能专精</div>${SKILL_BRANCHES[id].map(br=>{const selected=skillBranch(hero,id)?.id===br.id,cost=hero.skillBranches?.[id]?{gold:22,shards:2}:{gold:35,shards:3};return `<button class="branch-option ${selected?'selected':''}" data-action="skill-branch" data-id="${hero.id}" data-kind="${id}" data-branch="${br.id}" ${lv<1||selected||game.gold<cost.gold||game.shards<cost.shards?'disabled':''}><strong>${selected?'✓ ':''}${br.name}</strong><small>${br.desc}</small><em>${selected?'当前专精':lv<1?'需技能 +1':`${cost.gold} ◈ / ${cost.shards} ✥`}</em></button>`}).join('')}</div></article>`}).join('')}</div></div>`;
}
function difficultyChooserUI(){return `<div class="difficulty-picker"><div class="eyebrow">DUNGEON THREAT · 地牢难度</div><div class="difficulty-options">${Object.entries(DIFFICULTIES).map(([id,d])=>`<button class="difficulty-option ${game.selectedDifficulty===id?'selected':''}" data-action="difficulty" data-id="${id}" aria-pressed="${game.selectedDifficulty===id}"><b>${d.icon} ${d.name}</b><small>${d.desc}</small><em>金币 ×${d.gold} · 碎片 ×${d.shards}</em></button>`).join('')}</div></div>`;}
function regionChooserUI(){return `<div class="region-picker"><div class="eyebrow">CHOOSE A DUNGEON · 选择地牢</div><div class="region-options">${Object.entries(REGIONS).map(([id,r])=>`<button data-action="region" data-id="${id}" class="region-option region-${id} ${game.selectedRegion===id?'selected':''}" aria-pressed="${game.selectedRegion===id}"><span class="region-symbol">${r.symbol}</span><span class="region-copy"><b>${r.name}</b><small>${r.desc}</small><em>胜利 ${game.regionVictories?.[id]||0} 次 · 威胁等级 ${regionThreatLevel(game,id)} · 金币 ×${r.goldMult} · 碎片 ×${r.shardMult}</em></span><span class="region-check">${game.selectedRegion===id?'✓':'◇'}</span></button>`).join('')}</div><div class="region-hazard">${REGIONS[game.selectedRegion||'crypt'].hazard}</div></div>`;}
function expeditionPlanUI(){return `<div class="expedition-plans"><div class="eyebrow">TACTICS · 出征方针</div>${Object.entries(EXPEDITION_PLANS).map(([id,plan])=>`<button data-action="plan" data-id="${id}" class="plan-row ${game.expeditionPlan===id?'chosen':''}" aria-pressed="${game.expeditionPlan===id}"><span class="plan-icon">${plan.icon}</span><span><b>${plan.name}</b><small>${plan.desc}</small></span><span class="plan-check">${game.expeditionPlan===id?'✓':'◇'}</span></button>`).join('')}</div>`;}
function campNavBar(){
 const items=[['camp','营地','⌂'],['heroes','英雄','♟'],['archive','档案','▤']];
 return `<nav class="camp-side-nav" role="tablist" aria-label="营地导航">${items.map(([id,lab,ic])=>
  `<button class="camp-side-item ${campSection===id?'active':''}" role="tab" aria-selected="${campSection===id}" data-action="camp-section" data-id="${id}"><span class="camp-side-icon">${ic}</span><span>${lab}</span></button>`
 ).join('')}</nav>`;
}
function campBuildingChip(id){
 const def=BUILDINGS[id],lv=buildingLevel(game,id),cost=buildingCost(game,id),max=lv>=MAX_BUILDING_LEVEL;
 return `<article class="camp-building" data-building="${id}">
  <div class="camp-building-icon">${def.icon}</div>
  <div class="camp-building-body">
   <div class="camp-building-name">${def.name} <em>Lv.${lv}</em></div>
   <div class="camp-building-desc">${def.desc}</div>
   <div class="town-meter">${Array.from({length:MAX_BUILDING_LEVEL},(_,i)=>`<i class="${i<lv?'filled':''}"></i>`).join('')}</div>
  </div>
  ${max?'<span class="camp-building-max">已满级</span>':button(`升级 · ${cost.gold}◈`,'building',`data-id="${id}" ${game.gold<cost.gold||game.shards<cost.shards?'disabled':''}`,'btn btn-tiny btn-ghost')}
 </article>`;
}
function campTeamStrip(){
 return `<div class="camp-team-strip">
  <div class="camp-strip-head"><span class="eyebrow">EXPEDITION TEAM · 远征队伍</span>
   <span class="camp-strip-note">点击英雄卡可在「英雄」页管理站位、装备与天赋</span></div>
  <div class="camp-team-row">
   ${game.heroes.map(h=>{
    const t=CLASSES[h.classId],xp=h.xp??Math.min(99,((h.level||1)-1)*22+8);
    return `<button class="camp-team-card" data-action="hero-focus" data-id="${h.id}" title="${ESC(h.name)} · ${t.name}">
     <div class="camp-team-face" style="--accent:${t.color}">${svgPortrait(h.classId)}</div>
     <div class="camp-team-meta">
      <b>${ESC(h.name)}</b>
      <small>${t.name} · Lv.${h.level}</small>
      <div class="bar hp"><span style="width:${percent(h.hp,h.maxHp)}%"></span></div>
      <div class="bar xp"><span style="width:${clamp(xp,0,100)}%"></span></div>
      <div class="camp-team-nums">HP ${Math.round(h.hp)}/${h.maxHp} · 经验 ${xp}/100</div>
     </div>
    </button>`;
   }).join('')}
  </div>
 </div>`;
}
function campReserveStrip(){
 const reserves=game.reserveHeroes||[];
 return `<div class="camp-reserve-strip">
  <span class="eyebrow">RESERVES · 后备英雄 ${reserves.length}/${MAX_RESERVES}</span>
  <div class="camp-reserve-row">
   ${reserves.map(h=>`<button class="camp-reserve-chip" data-action="hero-focus" data-id="${h.id}" title="${ESC(h.name)}">${svgPortrait(h.classId)}<i>${ESC(h.name)}</i></button>`).join('')}
   ${Array.from({length:Math.max(0,Math.min(3,MAX_RESERVES-reserves.length))},()=>`<button class="camp-reserve-chip empty" data-action="camp-section" data-id="heroes" title="前往招募">＋</button>`).join('')}
   ${button('招募/管理','camp-section','data-id="heroes"','btn btn-tiny btn-ghost')}
  </div>
 </div>`;
}
function campQuickActions(){
 const cheapest=game.heroes.filter(h=>h.hp<h.maxHp).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
 const healCost=campHealCost(game);
 return `<div class="camp-quick-actions">
  ${button(`治疗${cheapest?` · ${healCost}◈`:''}`,'quick-heal',`${cheapest?`data-id="${cheapest.id}"`:'disabled'} ${game.gold<healCost?'disabled':''}`,'btn camp-quick')}
  ${button('训练','camp-section','data-id="heroes" data-tab="skills"','btn camp-quick')}
  ${button('锻造','camp-section','data-id="heroes" data-tab="team"','btn camp-quick')}
  ${button('升级','camp-section','data-id="archive" data-tab="town"','btn camp-quick')}
 </div>`;
}
function campOverview(){
 const region=REGIONS[game.selectedRegion]||REGIONS.crypt;
 return `<div class="camp-overview">
  <div class="camp-scene">
   <div class="camp-scene-glow"></div>
   <div class="camp-buildings">${['infirmary','chapel','workshop','watchtower'].map(campBuildingChip).join('')}</div>
   ${campQuickActions()}
  </div>
  ${campTeamStrip()}
  ${campReserveStrip()}
  <div class="camp-depart-bar">
   <div class="camp-depart-info">
    <span>下一站：${region.name}</span>
    <small>${DIFFICULTIES[game.selectedDifficulty]?.name||''} · ${EXPEDITION_PLANS[game.expeditionPlan]?.name||''} · 火把 ${game.supplies.torches} / 绷带 ${game.supplies.bandages}</small>
   </div>
   ${button('出发 <span>→</span>','expedition','','btn btn-gold camp-depart')}
  </div>
 </div>`;
}
function heroHub(){
 return `${campTabs()}<div class="camp-main"><div class="main-column">${
  campTab==='roster'?rosterPage():campTab==='trinkets'?trinketsPage():campTab==='town'?townPage():campTab==='talents'?talentsPage():campTab==='journal'?journalPage():campTab==='achievements'?achievementsPage():campTab==='skills'?skillTrainingPage():
  `${label('远征小队','THE COMPANY')}<div class="team-grid">${game.heroes.map(h=>heroCard(h,{camp:true})).join('')}</div><p class="hint-foot">治疗、升级、锻造和编队仅可在营地操作。饰品属性将在下一次战斗中生效。</p>`
 }</div>${campSidebar()}</div>`;
}
function campSidebar(){
 return `<aside class="panel sidebar"><div class="eyebrow">EXPEDITION</div><h2>走进灰烬深处</h2><p class="muted">腐朽的地底传来召唤。准备物资，选择路线，活着带回遗物。</p><div class="ornamental-line"></div>${['torches','bandages','potions','sigils'].map(k=>{const m=SUPPLY_META[k],cur=game.supplies[k]||0,cap=MAX_SUPPLIES[k];return `<div class="supply"><span>${m.icon} ${m.name} <strong>${cur} / ${cap}</strong></span>${button('+1 · '+m.cost+' ◈','buy',`data-type="${k}" ${game.gold<m.cost||cur>=cap?'disabled':''}`,'btn btn-tiny btn-ghost')}</div>`}).join('')}${regionChooserUI()}${difficultyChooserUI()}${expeditionPlanUI()}<div class="ornamental-line"></div><div class="stats-mini"><div><span>远征次数</span><strong>${game.expeditions}</strong></div><div><span>存档位置</span><strong>${slot} / 3</strong></div><div><span>营地天数</span><strong>${game.day}</strong></div></div>${button('开始远征 <span>→</span>','expedition','','btn btn-gold btn-full btn-xl')}<div class="sidebar-notice">提示：背包饰品会在完成远征或撤退后带回。全队阵亡会失去本次饰品战利品。</div></aside>`;
}
function archiveHub(){
 return `${campTabs()}<div class="camp-main"><div class="main-column">${campTab==='town'?townPage():campTab==='achievements'?achievementsPage():journalPage()}</div>${campSidebar()}</div>`;
}
function campPage(){
 return `<section class="content-view camp-view">
  <div class="view-hero"><div class="view-hero-text"><div class="eyebrow overline">THE LAST SANCTUARY</div><h1>残火营地</h1><p>远方的钟声响了三次。这里的人知道，那是危险正在靠近。</p></div><div class="camp-flame"><span>♨</span></div></div>
  <div class="camp-layout">
   ${campNavBar()}
   <div class="camp-stage">
    ${campSection==='camp'?campOverview():campSection==='heroes'?heroHub():archiveHub()}
   </div>
  </div>
  <div class="foot-lore">“希望不是一团永远燃烧的火焰；希望是黑暗里依然愿意拿起火把的手。”</div>
 </section>`;
}

function mapNodeDetail(){
 const ex=game.expedition;if(!ex)return '';
 const sel=mapSelectedNode?nodePreview(game,mapSelectedNode):null;
 const can=reachableNodes(game).map(n=>n.id);
 if(!sel)return '<div class="map-detail empty"><div class="eyebrow">NODE INTEL</div><h3>选择一个节点</h3><p class="muted">点击地图上可探索的房间，查看遭遇预估、风险与战利品，再决定是否进入。</p></div>';
 const power=teamPower(game);
 const riskSkulls='<span class="risk-skulls">'+'☠'.repeat(sel.risk)+'<i>'+'☠'.repeat(5-sel.risk)+'</i></span>';
 const enterable=can.includes(sel.id)&&!sel.visited;
 return '<div class="map-detail">'+
  '<div class="eyebrow">NODE INTEL · 第 '+(sel.layer+1)+' 层</div>'+
  '<h3 class="map-detail-name">'+ESC(sel.name)+'</h3>'+
  '<div class="map-detail-type">'+(TYPE_ICON[sel.type]||'◇')+' '+ESC(TYPE_NAMES[sel.type]||sel.type)+(sel.visited?' · 已探索':'')+'</div>'+
  '<div class="map-detail-row"><span>可能遭遇</span><ul>'+sel.encounters.map(e=>'<li>'+ESC(e)+'</li>').join('')+'</ul></div>'+
  '<div class="map-detail-row"><span>通关奖励</span><ul>'+sel.rewards.map(e=>'<li>'+ESC(e)+'</li>').join('')+'</ul></div>'+
  '<div class="map-detail-row"><span>风险评估</span>'+riskSkulls+'</div>'+
  (sel.power?'<div class="map-detail-row"><span>推荐战力</span><strong class="'+(power>=sel.power?'ok-text':'danger-text')+'">'+sel.power+'（我方 '+power+'）</strong></div>':'')+
  (enterable?button('进入节点 →','enter-node','data-id="'+sel.id+'"','btn btn-gold btn-full'):sel.visited?'<p class="small-muted">该房间已经探索完毕。</p>':'<p class="small-muted">该节点尚未连通，先清理相邻房间。</p>')+
 '</div>';
}
function mapTeamStrip(){
 const ex=game.expedition;if(!ex)return '';
 const use=(kind,hero,disabled)=>button(kind==='potion'?'⚗ 药剂':'✥ 圣徽',kind==='potion'?'use-potion':'use-sigil','data-id="'+hero.id+'" '+(disabled?'disabled':''),'btn btn-tiny btn-ghost');
 return '<div class="map-team-strip"><div class="map-strip-head"><b>远征队伍</b><span class="map-strip-note">补给：♨ 火把 '+ex.torch+' · ✚ 绷带 '+ex.bandages+' · ⚗ 药剂 '+(ex.potions||0)+' · ✥ 圣徽 '+(ex.sigils||0)+'</span></div><div class="map-strip-row">'+
  game.heroes.map(h=>'<div class="map-strip-card"><div class="map-strip-face">'+svgPortrait(h.classId)+'</div><div class="map-strip-meta"><b>'+ESC(h.name)+'</b><small>'+ESC(CLASSES[h.classId]?.name||'')+'</small><div class="bar hp"><span style="width:'+percent(h.hp,h.maxHp)+'%"></span></div><div class="map-strip-nums">'+Math.round(h.hp)+'/'+h.maxHp+' HP · 压力 '+Math.round(h.stress||0)+'</div><div class="map-strip-actions">'+use('potion',h,(ex.potions||0)<=0||h.hp<=0||h.hp>=h.maxHp)+use('sigil',h,(ex.sigils||0)<=0||h.hp<=0||(h.stress||0)<=0)+'</div></div></div>').join('')+
 '</div></div>';
}
function mapPage(){const ex=game.expedition;const region=REGIONS[ex.region]||REGIONS.crypt;const possible=reachableNodes(game).map(n=>n.id);const pos=n=>({x:90+n.layer*174,y:195+n.row*103});let edges='';
 for(let layer=0;layer<4;layer++){const src=ex.nodes.filter(n=>n.layer===layer),dst=ex.nodes.filter(n=>n.layer===layer+1);for(const a of src)for(const b of dst){if(b.layer===4||Math.abs(a.row-b.row)<=1){const v=pos(a),w=pos(b);edges+=`<path d="M${v.x} ${v.y} C${v.x+60} ${v.y},${w.x-60} ${w.y},${w.x} ${w.y}" class="map-edge ${a.visited&&b.visited?'travelled':''}"/>`;}}}
 const nodes=ex.nodes.map(n=>{const v=pos(n),can=possible.includes(n.id),visited=n.visited,scouted=buildingLevel(game,'watchtower')>0&&n.layer<=ex.layer+1+buildingLevel(game,'watchtower'),known=can||visited||scouted;return `<g transform="translate(${v.x},${v.y})" class="map-node ${can?'available':''} ${visited?'explored':''} ${n.type==='boss'?'map-boss':''} ${mapSelectedNode===n.id?'selected':''}" data-action="node" data-id="${n.id}" role="button" tabindex="0" aria-label="${TYPE_NAMES[n.type]}"><circle r="31" class="node-outer"/><circle r="24" class="node-inner"/><text y="8" text-anchor="middle" class="node-symbol">${known?TYPE_ICON[n.type]:'◇'}</text><text y="53" text-anchor="middle" class="node-label">${known?(n.name||TYPE_NAMES[n.type]):'未知房间'}</text></g>`}).join('');
 return `<section class="content-view map-view region-${ex.region||'crypt'}"><div class="view-heading"><div>${label(region.name,`DUNGEON · ${region.en}`)}<p class="muted">${region.desc} 每次只能前进一层，战利品需要活着带回营地。</p></div><div class="map-metrics"><div><span>深入层数</span><strong>${ex.layer+1} / 5</strong></div><div><span>火把</span><strong class="${ex.torch===0?'danger-text':''}">♨ ${ex.torch}</strong></div><div><span>绷带</span><strong>✚ ${ex.bandages}</strong></div><div><span>药剂</span><strong>⚗ ${ex.potions||0}</strong></div><div><span>圣徽</span><strong>✥ ${ex.sigils||0}</strong></div></div></div><div class="map-layout"><div class="map-panel"><div class="map-legend"><span><i class="dot active"></i> 可探索</span><span><i class="dot done"></i> 已探索</span><span><i class="dot upcoming"></i> 未知</span></div><div class="map-progress">${Array.from({length:5},(_,i)=>`<span class="${i<ex.layer?'cleared':i===ex.layer?'current':''}">第 ${i+1} 层</span>`).join('')}</div><svg viewBox="0 0 885 440" class="dungeon-map" role="img" aria-label="地牢路线图"><g class="map-edges">${edges}</g>${nodes}</svg><div class="map-floor">入口 <span>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span> 最深处</div></div><aside class="panel map-aside"><div class="eyebrow">CURRENT EXPEDITION</div><h3>路途中的战利品</h3><div class="loot-row"><span>金币</span><strong>◈ ${ex.lootGold}</strong></div><div class="loot-row"><span>遗物碎片</span><strong>✥ ${ex.lootShards}</strong></div><div class="loot-row"><span>待结算饰品</span><strong>✧ ${ex.lootItems?.length||0} 件</strong></div><div class="ornamental-line"></div>${mapNodeDetail()}<div class="ornamental-line"></div><div class="town-bonus">${region.symbol} ${region.name} · ${region.hazard}<div>难度：${DIFFICULTIES[ex.difficulty||'pilgrim']?.name||'巡礼'} · 方针：${(EXPEDITION_PLANS[ex.plan]||EXPEDITION_PLANS.standard).name} · 守夜塔 Lv.${buildingLevel(game,'watchtower')}</div></div><p class="small-muted">无火把时每进入一间房间，所有存活英雄会增加压力。</p>${button('撤退并带回战利品','retreat','','btn btn-ghost btn-full')}</aside></div>${mapTeamStrip()}</section>`;}
function statusBadges(unit){const ss=unit.statuses||{},names={poison:'中毒',bleed:'流血',guard:'守护',mark:'标记',weak:'虚弱',stun:'眩晕'};return Object.entries(names).filter(([key])=>ss[key]>0).map(([key,name])=>`<span class="status-token status-${key}" title="${name} · 剩余 ${ss[key]} 次行动">${name} ${ss[key]}</span>`).join('')||'<span class="status-token status-none">无异常</span>'}
function unitCard(unit,side){const enemy=side==='enemy',active=game.battle.activeId===unit.id,skill=chosenSkill&&SKILLS[chosenSkill],actor=currentActor(game),basic=chosenSkill==='__basic__',allowed=actor?.side==='hero'?(basic?(enemy&&unit.hp>0):skill?validTargets(game.battle,actor,skill).some(t=>t.id===unit.id):false):false;
 const info=enemy?ENEMIES[unit.type]:CLASSES[unit.classId],selected=inspectUnitId===unit.id;
 return `<button type="button" class="combat-unit ${unit.hp<=0?'dead':''} ${active?'unit-active':''} ${allowed?'unit-targetable':''} ${selected?'unit-inspected':''}" data-action="unit" data-id="${unit.id}" style="--accent:${info.color}" aria-label="${ESC(unit.name)}，站位 ${unit.rank}，生命 ${unit.hp}/${unit.maxHp}${allowed?'，可作为技能目标':''}"><div class="unit-position">${unit.rank}</div><div class="unit-art">${svgPortrait(enemy?unit.type:unit.classId,enemy)}</div><div class="unit-name">${ESC(unit.name)}</div><div class="unit-meter"><span style="width:${percent(unit.hp,unit.maxHp)}%"></span></div><div class="unit-numbers">${unit.hp} / ${unit.maxHp}</div>${!enemy?`<div class="unit-stress"><span style="width:${percent(unit.stress,100)}%"></span></div>`:''}${allowed?'<div class="target-indicator">⌖ 可选择</div>':''}${unit.statuses?.poison>0?'<i class="status-dot poison" title="中毒">☠</i>':''}${unit.statuses?.guard>0?'<i class="status-dot guard" title="守护">✧</i>':''}</button>`;
}
function combatUnitInfo(b,actor){const chosen=[...b.heroes,...b.enemies].find(u=>u.id===inspectUnitId)||actor||b.enemies.find(u=>u.hp>0)||b.heroes.find(u=>u.hp>0);
 if(!chosen)return '<span>暂无可查看单位</span>';
 const role=chosen.side==='hero'?CLASSES[chosen.classId]?.name:ENEMIES[chosen.type]?.name;
 return `<div class="unit-info-details"><div class="unit-info-title"><span>◈ ${ESC(chosen.name)}</span><small>${role||'未知职业'} · ${chosen.side==='hero'?'友军':'敌军'} · 站位 ${chosen.rank}</small></div><div class="unit-info-stats"><span>生命 <b>${chosen.hp}/${chosen.maxHp}</b></span><span>攻击 <b>${chosen.attack}</b></span><span>护甲 <b>${chosen.armor}</b></span><span>速度 <b>${chosen.speed}</b></span>${chosen.side==='hero'?`<span>压力 <b>${chosen.stress}/100</b></span>`:`<span>毒抗 <b>${enemyResistances(chosen.type).poison}%</b></span><span>流血抗 <b>${enemyResistances(chosen.type).bleed}%</b></span><span>眩晕抗 <b>${enemyResistances(chosen.type).stun}%</b></span>`}</div><div class="status-list">${statusBadges(chosen)}</div></div>`;
}
function battleSkillCard(id,index,actor,b,chosen){
 const s=SKILLS[id],lv=skillLevel(actor,id),branch=skillBranch(actor,id);
 const enabled=s.caster.includes(actor.rank),valid=enabled?validTargets(b,actor,s):[];
 const disabled=!enabled||valid.length===0;
 const cat=s.category||'damage';
 const catLabel=SKILL_CATEGORY_LABELS?.[cat]||'';
 return `<button class="skill-card cat-${cat} ${chosen===id?'chosen':''}" data-action="skill" data-id="${id}" ${disabled?'disabled':''} title="${ESC(s.desc)}">
  <span class="skill-card-tag">${catLabel}</span>
  <span class="skill-card-art">${s.icon}</span>
  <span class="skill-card-body"><b>${index}. ${ESC(s.name)}${lv?` +${lv}`:''}</b>
   <small>${ESC(s.desc)}</small>
   ${branch?`<em>${ESC(branch.name)}</em>`:''}
   <span class="skill-card-meta">命中 ${s.accuracy}% · 站位 ${s.caster.join('/')}</span>
  </span>
  <span class="skill-card-pips">${[1,2,3].map(n=>`<i class="${n<=(lv||0)?'filled':''}"></i>`).join('')}</span>
 </button>`;
}
function battleBasicCard(actor,chosen){
 const disabled=false;
 return `<button class="skill-card cat-attack ${chosen==='__basic__'?'chosen':''}" data-action="basic-attack" title="以 100% 攻击力进行普通攻击，无站位限制">
  <span class="skill-card-tag">攻击</span>
  <span class="skill-card-art">⚔</span>
  <span class="skill-card-body"><b>普攻</b><small>100% 攻击力 · 无站位限制</small>
   <span class="skill-card-meta">命中 92%</span></span>
  <span class="skill-card-pips"><i class="filled"></i><i class="filled"></i><i class="filled"></i></span>
 </button>`;
}
function battleHeroPanel(actor){
 if(!actor||actor.side!=='hero')return '';
 const heroRef=game.heroes.find(h=>h.id===actor.id)||actor;
 const stats=heroStats(heroRef,game);
 const xp=heroRef.xp??Math.min(99,((actor.level||1)-1)*22+8);
 return `<div class="battle-hero-panel">
  <div class="battle-hero-face">${svgPortrait(actor.classId,false,true)}</div>
  <div class="battle-hero-meta">
   <div class="battle-hero-name">${ESC(actor.name)}</div>
   <div class="battle-hero-sub">${ESC(CLASSES[actor.classId]?.name||'')} · Lv.${actor.level||1}</div>
   <div class="battle-hero-bars">
    <div class="bar hp"><span style="width:${percent(actor.hp,actor.maxHp)}%"></span></div>
    <div class="bar xp"><span style="width:${clamp(xp,0,100)}%"></span></div>
   </div>
   <div class="battle-hero-nums"><b>HP ${Math.round(actor.hp)}/${actor.maxHp}</b><span>经验 ${xp}/100</span></div>
   <div class="battle-hero-stats">
    <span>攻击 <b>${actor.attack}</b></span>
    <span>防御 <b>${actor.armor}</b></span>
    <span>暴击 <b>${10+(stats.critBonus||0)}%</b></span>
    <span>速度 <b>${actor.speed}</b></span>
   </div>
  </div>
  <button class="btn btn-tiny btn-ghost battle-hero-detail" data-action="unit" data-id="${actor.id}">详情</button>
 </div>`;
}
function battlePage(){
 const b=game.battle,actor=currentActor(game),region=REGIONS[b.region]||REGIONS.crypt;
 if(!b)return '<div>战斗恢复中...</div>';
 const hero=actor?.side==='hero',skillList=hero?CLASSES[actor.classId].skills:[];
 const chosen=chosenSkill==='__basic__'?'__basic__':(chosenSkill&&skillList.includes(chosenSkill)?chosenSkill:null);
 const units=[...b.heroes,...b.enemies];
 const queue=b.order.slice(Math.max(0,b.turnIndex-1)).filter(id=>units.some(u=>u.id===id&&u.hp>0)).slice(0,10).map(id=>{
  const u=units.find(x=>x.id===id);if(!u)return '';
  return `<span class="initiative-portrait ${u.side==='hero'?'friendly':'hostile'} ${id===actor?.id?'currently':''}" title="${ESC(u.name)}">
   ${svgPortrait(u.side==='hero'?u.classId:u.type,u.side==='enemy')}
   <i>${ESC(u.name)}</i></span>`;
 }).join('');
 const basicMode=chosen==='__basic__';
 return `<section class="content-view battle-view region-${b.region||'crypt'}">
  <div class="battle-header">
   <div><div class="eyebrow">${region.en} · ${b.kind==='boss'?'BOSS':b.kind==='elite'?'ELITE':'DUNGEON'} · ROUND ${b.round}</div>
    <h2>${b.kind==='boss'?`首领：${ENEMIES[region.boss[0]].name} · 第 ${b.bossPhase||1} 阶段`:b.kind==='elite'?`精英战：${ELITE_TRAITS[b.trait]?.name||'精英来袭'}`:'阴影中的伏击'}</h2>
    <div class="combat-region-rule">${b.kind==='elite'?(ELITE_TRAITS[b.trait]?.desc||'')+' · ':''}${region.hazard}</div></div>
   <div class="battle-turn">${hero?`<span class="turn-dot"></span> 轮到 <strong>${ESC(actor.name)}</strong>`:'敌人行动中'} <span>· ${b.heroes.filter(h=>h.hp>0).length} vs ${b.enemies.filter(e=>e.hp>0).length}</span></div>
  </div>
  <div class="turn-strip portrait-strip"><span>行动序列</span><div class="initiative-track">${queue||'<span>准备下一回合...</span>'}</div></div>
  <div class="enemy-intents"><span class="intent-heading">敌方行动预判 <small>预测行动类型，非锁定目标</small></span>
   ${b.enemies.filter(e=>e.hp>0).slice(0,4).map(e=>{const i=enemyIntent(e,b);return `<div class="intent-chip ${i.level}" title="${ESC(i.detail)}"><strong>${ESC(e.name)}</strong><span>${ESC(i.title)}</span></div>`}).join('')}</div>
  <div class="combat-arena region-${b.region||'crypt'} ${b.kind==='boss'?'boss-arena':''}">
   <div class="crypt-moon"></div><div class="combat-fog fog-left"></div><div class="combat-fog fog-right"></div><div class="combat-floor"></div><div class="arena-seal">✧</div>
   <div class="combat-side heroes">${[...b.heroes].sort((a,c)=>c.rank-a.rank).map(u=>unitCard(u,'hero')).join('')}</div>
   <div class="combat-vs"><span>⚔</span></div>
   <div class="combat-side enemies">${[...b.enemies].sort((a,c)=>a.rank-c.rank).map(u=>unitCard(u,'enemy')).join('')}</div>
  </div>
  <div class="combat-action-report">${ESC(b.logs[0]?.text||'警惕阴影中的动静……')}</div>
  <div class="combat-inspector"><span class="eyebrow">${(chosen||basicMode)?'SELECT TARGET · 目标选择':'UNIT INSPECTOR · 单位情报'}</span>
   ${combatUnitInfo(b,actor)}
   <span class="inspector-tip">${basicMode?'普攻：点击敌方目标发动普通攻击':chosen?`释放「${SKILLS[chosen].name}」：${SKILLS[chosen].side==='ally'?'选择队友':'选择敌人'}`:'点击任一角色查看属性与异常状态'}</span></div>
  <div class="combat-dashboard">
   <div class="battle-left-col">
    ${battleHeroPanel(actor)}
    <div class="combat-skills panel">
     <div class="eyebrow">${hero?`${ESC(actor.name)} · 技能卡`:'行动进行中'}</div>
     <div class="skill-card-grid">
      ${hero?skillList.map((id,i)=>battleSkillCard(id,i+1,actor,b,chosen)).join('')+battleBasicCard(actor,chosen):'<div class="muted">敌人行动已自动执行，请等待下一位英雄。</div>'}
     </div>
     <div class="battle-main-actions">
      ${hero?`<button class="btn btn-gold" data-action="basic-attack" ${basicMode?'disabled':''}>攻击</button>
      <button class="btn" data-action="end-turn">结束回合</button>`:'<span class="muted">等待敌方行动…</span>'}
     </div>
     <div class="skill-footer">
      ${basicMode?'<span>⌖ 点击敌方目标发动普通攻击</span>':chosen?`<span>⌖ ${SKILLS[chosen].side==='ally'?'点击己方英雄':'点击敌方目标'}施放 ${SKILLS[chosen].name}</span>`:'<span>选择技能卡后，可攻击的目标将以金色边框显示</span>'}
     </div>
    </div>
   </div>
   <div class="combat-log panel"><div class="eyebrow">BATTLE LOG · 战斗记录</div>
    <div class="log-scroll" aria-live="polite">${b.logs.slice(0,settings.shortLogs?4:12).map(l=>`<div class="log-line ${l.type}">${ESC(l.text)}</div>`).join('')}</div></div>
  </div>
  <div class="battle-hint"><span>站位规则：1 = 前排，4 = 后排；点击人物可查看属性</span><span>快捷键 1/2/3 技能 · A 普攻 · Space 结束回合 · Esc 取消</span></div>
 </section>`;
}

function eventPage(){const event=game.event,region=regionOf(game),presentation=eventPresentation(event,region);
 return `<section class="content-view event-view region-${presentation.region} event-${presentation.motif}"><div class="event-chamber"><div class="event-scene" aria-hidden="true"><span class="event-horizon"></span><span class="event-silhouette"></span><span class="event-light"></span></div><div class="event-sigil"><div class="event-sigil-inner">${presentation.glyph}</div></div><div class="eyebrow overline">${ESC(event.eyebrow)} · ${presentation.kicker}</div><h1>${ESC(event.title)}</h1><div class="ornament">✦ ─── ❖ ─── ✦</div><p class="event-story">${ESC(event.desc)}</p><div class="event-choice-heading">请选择行动 <span>CHOICES HAVE CONSEQUENCES</span></div><div class="event-choices">${event.choices.map((choice,i)=>`<button class="choice" data-action="choice" data-id="${ESC(choice.kind)}"><span class="choice-index">0${i+1}</span><span><b>${ESC(choice.label)}</b><small>${ESC(choice.hint)}</small></span><span class="choice-arrow">→</span></button>`).join('')}</div></div></section>`;
}
function resultPage(){const r=game.result,win=r.reason==='victory',region=REGIONS[r.region]||REGIONS.crypt;return `<section class="content-view result-view region-${r.region||'crypt'}"><div class="result-mark">${win?'✦':r.reason==='retreat'?'◇':'☽'}</div><div class="eyebrow overline">${region.name} · ${DIFFICULTIES[r.difficulty||'pilgrim']?.name||'巡礼'} · EXPEDITION REPORT</div><h1>${win?'黎明尚未消亡':r.reason==='retreat'?'从深渊归来':'黑暗夺走一切'}</h1><p class="result-sub">${win?'代价沉重，但你们守住了誓约。':r.reason==='retreat'?'逃离不代表怯懦。仍然活着，就是机会。':'火焰熄灭了，但营地仍在等待。'}</p><div class="result-grid"><div><small>探索房间</small><strong>${r.rooms}</strong></div><div><small>收获金币</small><strong>◈ ${r.rewards.gold}</strong></div><div><small>遗物碎片</small><strong>✥ ${r.rewards.shards}</strong></div><div><small>饰品战利品</small><strong>✧ ${r.rewards.items?.length||0}</strong></div></div>${button('返回残火营地 <span>→</span>','camp','','btn btn-gold btn-xl')}</section>`;}
function savesPage(){return `<section class="content-view utility-view"><div class="utility-heading">${label('命运的残页','SAVE ARCHIVES')}<p>所有进度仅存储在当前浏览器。建议定期导出 JSON 备份。</p></div><div class="saves-grid">${Array.from({length:SLOT_COUNT},(_,i)=>{const num=i+1,rec=slotRecord(num),saved=rec&&snapshotValid(rec)&&isValidSave(rec.data)?rec.data:null;return `<article class="save-card"><div class="save-index">ARCHIVE <strong>0${num}</strong></div><div class="save-emblem">${saved?'✥':'◇'}</div><h3>${saved?'残火营地 · 第 '+(saved.day||1)+' 日':rec?'存档需要恢复':'空白存档'}</h3><p>${saved?`远征 ${saved.expeditions||0} 次 · ${stamp(rec.updatedAt)}`:rec?'存档异常，请恢复备份':'尚未记录任何誓约'}</p><div class="save-actions">${saved?`${button('继续游戏','load',`data-slot="${num}"`,'btn btn-gold btn-full')}${button('导出备份','export',`data-slot="${num}"`,'btn btn-ghost btn-full')}${button('覆盖新建','new',`data-slot="${num}"`,'btn btn-ghost btn-full')}${button('删除存档','delete',`data-slot="${num}"`,'btn btn-danger btn-full')}`:button('创建新游戏','new',`data-slot="${num}"`,'btn btn-gold btn-full')}${button('从 JSON 导入','import',`data-slot="${num}"`,'btn btn-ghost btn-full')}${!saved&&rec?button('删除损坏存档','delete',`data-slot="${num}"`,'btn btn-danger btn-full'):''}${(cachedBackups[num]||[]).map(b=>button(`恢复备份 ${b.age} · 第${b.day||'?'}日${b.valid?'':'（损坏）'}`,'restore',`data-slot="${num}" data-age="${b.age}" ${b.valid?'':'disabled'}`,'btn btn-ghost btn-full')).join('')}</div></article>`}).join('')}</div><div class="warning-box"><strong>重要存档提示</strong><p>隐私模式、浏览器清理网站数据、切换浏览器或域名会导致进度不可访问。导出 JSON 文件可以离线备份；导入时会校验格式，并在覆盖前确认。</p></div></section>`;}
function settingsPage(){return `<section class="content-view utility-view"><div class="utility-heading">${label('旅人手记','SETTINGS')}<p>全部设置仅保存在当前浏览器，游戏不需要账号、联网或后端服务。</p></div><div class="settings-panel panel">
 <div class="setting-row"><div><h3>界面音效</h3><p>启用或静音合成音效</p></div><button class="switch ${settings.sound?'on':''}" data-action="setting-sound" aria-label="切换音效"><span></span></button></div>
 <div class="setting-row"><div><h3>环境音乐</h3><p>营地与旅途的低吟氛围音（合成生成，离线可用）</p></div><button class="switch ${settings.music?'on':''}" data-action="setting-music" aria-label="切换环境音乐"><span></span></button></div>
 <div class="setting-row"><div><h3>减少动态效果</h3><p>关闭多数装饰性过渡和动画</p></div><button class="switch ${settings.lowMotion?'on':''}" data-action="setting-motion" aria-label="切换减少动效"><span></span></button></div>
 <div class="setting-row"><div><h3>大字体模式</h3><p>扩大文字，方便在较小屏幕阅读</p></div><button class="switch ${settings.largeText?'on':''}" data-action="setting-text" aria-label="切换大字体"><span></span></button></div>
 <div class="setting-row"><div><h3>精简战斗日志</h3><p>仅显示最近 4 条记录，关闭则显示最近 12 条</p></div><button class="switch ${settings.shortLogs?'on':''}" data-action="setting-log" aria-label="切换精简战斗日志"><span></span></button></div>
 <div class="setting-row"><div><h3>音效音量</h3><p>调整战斗、治疗和菜单音效（0 = 静音）</p></div><label class="volume-control"><input id="volume-control" type="range" min="0" max="100" step="5" value="${settings.volume}" aria-label="音效音量"/><output id="volume-value" for="volume-control">${settings.volume}%</output></label></div>
 <div class="setting-row"><div><h3>战斗表现节奏</h3><p>控制技能字样、伤害数字及打击动效速度，不改变回合规则</p></div><div class="pace-options" role="group" aria-label="战斗表现节奏">${[['slow','沉浸'],['normal','标准'],['fast','快速']].map(([value,title])=>`<button type="button" data-action="pace" data-id="${value}" class="btn btn-tiny ${settings.pace===value?'btn-gold':'btn-ghost'}" aria-pressed="${settings.pace===value}">${title}</button>`).join('')}</div></div>
 <div class="setting-row"><div><h3>显示模式</h3><p>切换浏览器全屏（可能需要许可）</p></div>${button('切换全屏','fullscreen','','btn btn-ghost')}</div><div class="ornamental-line"></div><p class="small-muted">版本 V1.0 · 纯 Web · IndexedDB 本地存档 · 原创游戏与 SVG 场景 · 支持离线运行。</p></div></section>`;}
function footer(){return `<footer class="site-footer"><span>ASHEN VOW © ORIGINAL BROWSER PROTOTYPE</span><span><span class="save-light"></span><span id="save-text">${saveStatus}</span> · 存档 ${slot} / 3</span></footer><div class="toast" id="toast" role="status"></div><input type="file" id="import-file" accept="application/json,.json" hidden/>`}
function render(){clearFx();if(game&&settings.sound&&settings.music&&!bgmNodes)startBgm();root.innerHTML=`<div class="app-frame ${reducedMotion()?'low-motion':''} ${settings.largeText?'large-text':''} pace-${settings.pace}"><div class="grain"></div>${hud()}<main class="main">${view==='menu'?homePage():view==='saves'?savesPage():view==='settings'?settingsPage():view==='guide'?guidePage():view==='codex'?codexPage():!game?homePage():game.phase==='camp'?campPage():game.phase==='map'?mapPage():game.phase==='battle'?battlePage():game.phase==='event'?eventPage():resultPage()}</main>${footer()}</div>`;
 const f=document.getElementById('import-file');if(f)f.addEventListener('change',handleImport);
}
async function handleImport(e){const file=e.target.files?.[0];if(!file)return;try{const data=await readSaveFile(file,isValidSave);if(!window.confirm(`确定把导入的存档写入存档槽 ${importTarget} 吗？该槽位旧数据会被覆盖。`))return;await saveQueue.catch(()=>{});await storeSlot(importTarget,data);await reloadSlots();if(game&&slot===importTarget){game=ensureProgression(data);view='game';chosenSkill=null}else{view='saves'}render();announce('存档导入成功');}catch(err){announce(`导入失败：${err.message}`,true)}finally{e.target.value='';}}
async function actionRun(el){const a=el.dataset.action, id=el.dataset.id, n=Number(el.dataset.slot);
 if(a==='nav-menu'){uiNavigate('menu');return;}if(a==='nav-game'){if(game)uiNavigate('game');return;}
 if(a==='nav-saves'){await reloadSlots();uiNavigate('saves');return;}if(a==='nav-settings'){uiNavigate('settings');return;}if(a==='nav-guide'){uiNavigate('guide');return;}if(a==='nav-codex'){uiNavigate('codex');return;}if(a==='codex-tab'){if(['heroes','skills','monsters','regions','equipment'].includes(id))codexTab=id;render();return;}
 if(a==='tutorial-done'){if(game&&!game.tutorialSeen){game.tutorialSeen=true;playSave();}uiNavigate(game?'game':'menu');return;}
 if(a==='new'){await startNew(n);return;}if(a==='load'){await load(n);return;}
 if(a==='delete'){if(!window.confirm(`确定彻底删除存档 ${n} 吗？此操作不可撤销，请先导出备份。`))return;await saveQueue.catch(()=>{});await deleteSlot(n);if(game&&slot===n){game=null;view='saves';saveStatus='存档已删除'}await reloadSlots();render();announce('存档已删除');return;}
 if(a==='export'){try{await saveQueue.catch(()=>{});const data=await getSlot(n);if(!data)throw Error('存档不存在');downloadSave(data,n);announce('已生成 JSON 存档备份');}catch(err){announce(err.message,true)}return;}
 if(a==='import'){importTarget=n;document.getElementById('import-file')?.click();return;}
 if(a==='restore'){const age=Number(el.dataset.age);if(!window.confirm(`恢复存档 ${n} 的第 ${age} 份备份吗？当前存档将被覆盖（完整的当前存档会尝试保留到备份历史）。`))return;await saveQueue.catch(()=>{});try{await restoreBackup(n,age,isValidSave);await reloadSlots();if(slot===n){game=ensureProgression(await getSlot(n));view='game';}render();announce('历史存档恢复成功');}catch(e){announce(`恢复失败：${e.message}`,true)}return;}
 if(a==='setting-sound'){settings.sound=!settings.sound;preferences.setItem('av-sound',settings.sound?'on':'off');render();if(settings.sound)sound();return;}
 if(a==='setting-music'){settings.music=!settings.music;preferences.setItem('av-music',settings.music?'on':'off');syncBgm();render();return;}
 if(a==='setting-motion'){settings.lowMotion=!settings.lowMotion;preferences.setItem('av-motion',settings.lowMotion?'low':'normal');render();return;}
 if(a==='setting-text'){settings.largeText=!settings.largeText;preferences.setItem('av-large-text',settings.largeText?'on':'off');render();return;}
 if(a==='setting-log'){settings.shortLogs=!settings.shortLogs;preferences.setItem('av-short-logs',settings.shortLogs?'on':'off');render();return;}
 if(a==='pace'){if(!['slow','normal','fast'].includes(id))return;settings.pace=id;preferences.setItem('av-pace',id);render();return;}
 if(a==='fullscreen'){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>announce('无法开启全屏模式',true));else document.exitFullscreen?.();return;}
 if(!game)return;
 if(a==='building'){if(mutate(()=>upgradeBuilding(game,id))!==undefined)sound('heal');return;}
 if(a==='plan'){mutate(()=>selectExpeditionPlan(game,id));sound('tap');return;}
 if(a==='region'){mutate(()=>selectRegion(game,id));sound('event');return;}
 if(a==='difficulty'){mutate(()=>selectDifficulty(game,id));sound('tap');return;}
 if(a==='train-skill'){const ok=mutate(()=>trainSkill(game,id,el.dataset.kind));if(ok!==false)sound('heal');return;}
 if(a==='skill-branch'){const ok=mutate(()=>chooseSkillBranch(game,id,el.dataset.kind,el.dataset.branch));if(ok!==false)sound('heal');return;}
 if(a==='treat-trait'){const ok=mutate(()=>treatNegativeTrait(game,id,el.dataset.kind));if(ok!==false)sound('heal');return;}
 if(a==='pray'){mutate(()=>prayAtCamp(game,id));sound('heal');return;}
 if(a==='talent-hero'){chosenEquipHero=id;render();return;}
 if(a==='talent'){mutate(()=>allocateTalent(game,id,el.dataset.kind));sound('heal');return;}
 if(a==='camp-tab'){campTab=id;render();return;}
 if(a==='camp-section'){campSection=id;const t=el.dataset.tab;if(t)campTab=t;else campTab=campSection==='archive'?'journal':'team';render();return;}
 if(a==='quick-heal'){if(id){const ok=mutate(()=>healAtCamp(game,id));if(ok!==false)sound('heal');}return;}
 if(a==='hero-focus'){campSection='heroes';campTab='team';chosenActiveHero=id;chosenEquipHero=id;render();return;}
 if(a==='active-choice'){chosenActiveHero=id;render();return;}
 if(a==='equip-hero'){chosenEquipHero=id;render();return;}
 if(a==='recruit'){mutate(()=>hireRecruit(game,Number(el.dataset.index)));sound('heal');return;}
 if(a==='swap-hero'){mutate(()=>swapHero(game,el.dataset.active,id));chosenActiveHero=null;sound();return;}
 if(a==='dismiss'){if(window.confirm('确定遣散该后备英雄吗？已装备饰品会回到仓库。'))mutate(()=>dismissReserve(game,id));return;}
 if(a==='equip'){mutate(()=>equipTrinket(game,el.dataset.hero,id,Number(el.dataset.slot)));sound('heal');return;}
 if(a==='unequip'){mutate(()=>unequipTrinket(game,id,Number(el.dataset.slot)));sound();return;}
 if(a==='salvage'){if(window.confirm('确定分解这件饰品换取遗物碎片吗？'))mutate(()=>salvageTrinket(game,id));return;}
 if(a==='heal'){mutate(()=>healAtCamp(game,id));sound();return;}
 if(a==='upgrade'){mutate(()=>upgradeHero(game,id));sound();return;}
 if(a==='forge'){mutate(()=>forgeGear(game,id,el.dataset.kind));sound('heal');return;}
 if(a==='move'){mutate(()=>moveHero(game,id,Number(el.dataset.direction)));sound('tap');return;}
 if(a==='buy'){mutate(()=>buySupplies(game,el.dataset.type));sound();return;}
 if(a==='expedition'){mutate(()=>beginExpedition(game));sound();return;}
 if(a==='node'){mapSelectedNode=id;sound();render();return;}
 if(a==='enter-node'){mapSelectedNode=null;const result=mutate(()=>enterNode(game,id));if(result!==false)sound(game?.phase==='battle'?'hit':'event');return;}
 if(a==='use-potion'){mutate(()=>usePotion(game,id));sound('heal');return;}
 if(a==='use-sigil'){mutate(()=>useSigil(game,id));sound('heal');return;}
 if(a==='choice'){mutate(()=>resolveEvent(game,id));sound();return;}
 if(a==='retreat'){if(window.confirm('现在撤退吗？已获得的战利品可以带回营地。'))mutate(()=>retreat(game));return;}
 if(a==='camp'){mutate(()=>backToCamp(game));return;}
 if(a==='skip'){const result=commitBattleAction(()=>skipTurn(game));if(result!==false)sound('tap');return;}
 if(a==='end-turn'){const result=commitBattleAction(()=>endTurn(game));if(result!==false)sound('tap');return;}
 if(a==='basic-attack'){
  const actor=currentActor(game);if(!actor||actor.side!=='hero'){announce('尚未轮到英雄行动',true);return;}
  chosenSkill=chosenSkill==='__basic__'?null:'__basic__';inspectUnitId=null;sound();render();return;
 }
 if(a==='skill'){
  const actor=currentActor(game),s=SKILLS[id];if(!actor||actor.side!=='hero'||!s.caster.includes(actor.rank)){announce('当前站位不可使用该技能',true);return;}
  chosenSkill=chosenSkill===id?null:id;inspectUnitId=null;sound();if(chosenSkill&&s.side==='self'){commitBattleAction(()=>performSkill(game,id,actor.id),id);}else render();return;
 }
 if(a==='unit'){
  const actor=currentActor(game),sk=SKILLS[chosenSkill];
  if(game.phase==='battle'&&chosenSkill==='__basic__'&&actor?.side==='hero'){
   if(game.battle.enemies.some(u=>u.id===id&&u.hp>0)){
    const ret=commitBattleAction(()=>basicAttack(game,id),'__basic__');
    if(ret?.ok===false)announce(ret.error,true);else chosenSkill=null;
   }else announce('请选择敌方目标',true);
   return;
  }
  if(game.phase==='battle'&&chosenSkill&&actor?.side==='hero'&&sk){
   if(validTargets(game.battle,actor,sk).some(u=>u.id===id)){
    const ret=commitBattleAction(()=>performSkill(game,chosenSkill,id),chosenSkill);
    if(ret?.ok===false)announce(ret.error,true);
    inspectUnitId=id;return;
   }
   announce('此目标不在技能的可选范围内',true);
  }
  inspectUnitId=inspectUnitId===id?null:id;render();return;
 }
 if(a==='bandage'){mutate(()=>useBandage(game,id));return;}
}
root.addEventListener('input',e=>{if(e.target?.id==='volume-control'){settings.volume=clamp(Number(e.target.value)||0,0,100);preferences.setItem('av-volume',String(settings.volume));const output=document.getElementById('volume-value');if(output)output.textContent=`${settings.volume}%`;}});
root.addEventListener('change',e=>{if(e.target?.id==='volume-control'){sound('tap');if(bgmNodes&&audioContext){const vol=(settings.volume/100)*0.22;bgmNodes.master.gain.linearRampToValueAtTime(Math.max(0.0001,vol),audioContext.currentTime+0.3);}}});
root.addEventListener('click',e=>{const control=e.target.closest('[data-action]');if(!control||control.disabled||waiting)return;waiting=true;Promise.resolve(actionRun(control)).catch(err=>{console.error(err);announce(err.message||'操作失败',true)}).finally(()=>waiting=false);});
window.addEventListener('keydown',e=>{if(view!=='game'||game?.phase!=='battle'||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='Escape'){chosenSkill=null;render();return;}if(['1','2','3'].includes(e.key)){const hero=currentActor(game);if(hero?.side==='hero'){const skill=CLASSES[hero.classId].skills[Number(e.key)-1];actionRun({dataset:{action:'skill',id:skill}});}}});
(async()=>{try{await reloadSlots();const first=cachedSlots.filter(x=>snapshotValid(x)&&isValidSave(x.data)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0];if(first){slot=first.slot;game=ensureProgression(first.data);saveStatus='本地存档就绪';}}catch(e){saveStatus='存档不可用';console.error(e);}render();})();
