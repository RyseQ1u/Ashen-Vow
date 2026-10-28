// 灰烬誓约 / Ashen Vow — deterministic, browser-independent game rules.
export const VERSION = 1;
export const CLASSES = {
  warden: { name:'灰盾卫士', title:'THE WARDEN', icon:'盾', color:'#d6b88b', maxHp:48, attack:7, speed:3, armor:3, lore:'沉默的壁垒。誓言从未被赦免。', skills:['cleave','bulwark','crush'] },
  ranger: { name:'夜巡猎手', title:'THE RANGER', icon:'弓', color:'#88ada3', maxHp:34, attack:9, speed:8, armor:0, lore:'她能听见黑暗伸出的手。', skills:['snipe','dagger','mark'] },
  medic: { name:'血烬医师', title:'THE MEDIC', icon:'药', color:'#c58f9d', maxHp:35, attack:5, speed:5, armor:1, lore:'救赎总与鲜血相伴。', skills:['mend','scarlet','remedy'] },
  occult: { name:'余烬术士', title:'THE OCCULTIST', icon:'焰', color:'#ac9bd1', maxHp:30, attack:10, speed:6, armor:0, lore:'烛火熄灭后，仍有什么在燃烧。', skills:['cinder','hex','solace'] },
  duelist: { name:'影刃决斗者', title:'THE DUELIST', icon:'刃', color:'#b4b4d4', maxHp:32, attack:9, speed:9, armor:0, lore:'她的剑总比影子先到。', skills:['bloodlet','puncture','taunt'] },
  penitent: { name:'忏悔行者', title:'THE PENITENT', icon:'罪', color:'#c99082', maxHp:43, attack:7, speed:4, armor:2, lore:'痛苦不能赎罪，但能教会人活下去。', skills:['scourge','atonement','sacrifice'] }
};
export const SKILLS = {
  cleave:{name:'断誓斩',desc:'向敌方前排挥出沉重一击。',type:'damage',power:1.2,accuracy:92,caster:[1,2],targets:[1,2],side:'enemy',icon:'⚔'},
  bulwark:{name:'铁壁誓言',desc:'自身获得 2 回合护卫，并减轻压力。',type:'guard',power:0,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'self',icon:'⬡'},
  crush:{name:'碎骨冲击',desc:'对敌方前排造成伤害，有概率眩晕。',type:'damage',power:0.8,accuracy:88,caster:[1,2],targets:[1,2],side:'enemy',status:'stun',chance:35,icon:'✦'},
  snipe:{name:'夜幕穿心',desc:'狙击中后排敌人，造成高额伤害。',type:'damage',power:1.4,accuracy:90,caster:[2,3,4],targets:[2,3,4],side:'enemy',icon:'➤'},
  dagger:{name:'隐刃',desc:'突袭前排，造成快速伤害。',type:'damage',power:0.9,accuracy:97,caster:[1,2,3],targets:[1,2],side:'enemy',icon:'⌁'},
  mark:{name:'猎影标记',desc:'标记目标，使其承受更高伤害。',type:'mark',power:0,accuracy:100,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',icon:'◎'},
  mend:{name:'缝合祷言',desc:'治疗一名友军。',type:'heal',power:12,accuracy:100,caster:[2,3,4],targets:[1,2,3,4],side:'ally',icon:'✚'},
  scarlet:{name:'猩红药剂',desc:'投掷腐蚀药剂，施加中毒。',type:'damage',power:0.6,accuracy:93,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',status:'poison',chance:100,icon:'◈'},
  remedy:{name:'清醒剂',desc:'降低一名友军的压力。',type:'relief',power:22,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',icon:'❋'},
  cinder:{name:'余烬飞弹',desc:'攻击任何敌方位置。',type:'damage',power:1.1,accuracy:93,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',icon:'✧'},
  hex:{name:'腐蚀咒印',desc:'伤害目标并附加虚弱。',type:'damage',power:0.65,accuracy:92,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',status:'weak',chance:100,icon:'☽'},
  solace:{name:'灰烬低语',desc:'抚慰一名友军，但术士承受少量压力。',type:'relief',power:28,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',selfStress:7,icon:'✺'},
  bloodlet:{name:'薄暮割裂',desc:'快速划伤目标，造成两回合流血。',type:'damage',power:.85,accuracy:96,caster:[1,2,3],targets:[1,2,3],side:'enemy',status:'bleed',chance:80,icon:'⌁'},
  puncture:{name:'破影突刺',desc:'精准穿刺任意位置的敌人。',type:'damage',power:1.25,accuracy:92,caster:[1,2,3,4],targets:[1,2,3,4],side:'enemy',icon:'➹'},
  taunt:{name:'假面佯攻',desc:'标记敌人，为队友制造破绽。',type:'mark',power:0,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'enemy',icon:'◎'},
  scourge:{name:'痛苦鞭笞',desc:'重击前排目标并造成流血。',type:'damage',power:.95,accuracy:90,caster:[1,2],targets:[1,2],side:'enemy',status:'bleed',chance:70,icon:'⚔'},
  atonement:{name:'赎罪吟唱',desc:'大幅减轻队友压力，自己获得少量压力。',type:'relief',power:34,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',selfStress:9,icon:'✶'},
  sacrifice:{name:'献血之誓',desc:'消耗自身 5 点生命治疗队友 19 点生命（无法使自己倒下）。',type:'heal',power:19,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',selfDamage:5,icon:'✚'}
};
export const ENEMIES = {
  thrall:{name:'腐朽侍从',icon:'侍',title:'THRALL',maxHp:22,attack:5,speed:4,armor:0,color:'#8c9e83'},
  ghoul:{name:'墓穴食尸鬼',icon:'噬',title:'GHOUL',maxHp:27,attack:7,speed:7,armor:0,color:'#a9a08e'},
  cultist:{name:'盲目修士',icon:'祷',title:'CULTIST',maxHp:24,attack:6,speed:5,armor:1,color:'#b58b97'},
  guardian:{name:'断剑守卫',icon:'剑',title:'GUARDIAN',maxHp:36,attack:8,speed:2,armor:3,color:'#9a9eaa'},
  wraith:{name:'无面游魂',icon:'魂',title:'WRAITH',maxHp:20,attack:7,speed:9,armor:0,color:'#91b5bd'},
  alchemist:{name:'疫病炼金师',icon:'瘴',title:'ALCHEMIST',maxHp:25,attack:6,speed:6,armor:1,color:'#b5ac84'},
  bonearcher:{name:'骨弓射手',icon:'骸',title:'BONE ARCHER',maxHp:21,attack:8,speed:7,armor:0,color:'#c7b8a3'},
  banshee:{name:'哀恸女妖',icon:'哀',title:'BANSHEE',maxHp:25,attack:6,speed:8,armor:0,color:'#9bafcb'},
  butcher:{name:'锈刃屠夫',icon:'屠',title:'BUTCHER',maxHp:44,attack:9,speed:2,armor:2,color:'#bf817a'},
  herald:{name:'灰烬传令官',icon:'令',title:'HERALD',maxHp:29,attack:6,speed:5,armor:1,color:'#aa98bb'},
  boss:{name:'噬誓者',icon:'王',title:'THE OATH EATER',maxHp:116,attack:11,speed:5,armor:2,color:'#d4a16c'},
  mireling:{name:'沼泽潜蛰',icon:'泥',title:'MIRELING',maxHp:27,attack:6,speed:6,armor:0,color:'#9aaf74'},
  sporewitch:{name:'孢疫巫妪',icon:'菌',title:'SPORE WITCH',maxHp:29,attack:6,speed:5,armor:1,color:'#9bc68e'},
  bogstalker:{name:'暗沼追猎者',icon:'爪',title:'BOG STALKER',maxHp:32,attack:9,speed:8,armor:0,color:'#799e7b'},
  leech:{name:'噬血水蛭',icon:'蚀',title:'BLOOD LEECH',maxHp:33,attack:7,speed:4,armor:1,color:'#b6a085'},
  bogcolossus:{name:'腐根巨像',icon:'根',title:'BOG COLOSSUS',maxHp:53,attack:10,speed:2,armor:3,color:'#a7b58e'},
  mirequeen:{name:'瘟沼之母',icon:'后',title:'MIRE MATRON',maxHp:126,attack:10,speed:4,armor:2,color:'#a9d291'},
  emberguard:{name:'烬铁卫兵',icon:'铁',title:'EMBER GUARD',maxHp:37,attack:8,speed:4,armor:4,color:'#c79d75'},
  slagbeast:{name:'熔渣兽',icon:'熔',title:'SLAG BEAST',maxHp:39,attack:10,speed:3,armor:2,color:'#d08b61'},
  cinderseer:{name:'炉火占卜师',icon:'瞳',title:'CINDER SEER',maxHp:26,attack:7,speed:7,armor:1,color:'#ddaa72'},
  smelter:{name:'铁灰熔匠',icon:'锤',title:'SMELTER',maxHp:42,attack:9,speed:2,armor:3,color:'#cb8b6b'},
  ironreaver:{name:'钢魂猎首',icon:'斧',title:'IRON REAVER',maxHp:58,attack:12,speed:5,armor:3,color:'#df9966'},
  forgeheart:{name:'永燃炉心',icon:'核',title:'FORGE HEART',maxHp:137,attack:12,speed:4,armor:4,color:'#ef9a55'}
};

// V0.6 long-form progression: difficulty, traits, combat technique training and new rooms.
export const DIFFICULTIES={
 pilgrim:{name:'巡礼',icon:'◇',desc:'标准难度，适合熟悉职业和线路。',hp:1,attack:1,stress:0,gold:1,shards:1},
 veteran:{name:'苦修',icon:'⚔',desc:'敌人生命 +20%，攻击 +15%，奖励更多。',hp:1.2,attack:1.15,stress:5,gold:1.25,shards:1.25},
 nightmare:{name:'无光',icon:'☠',desc:'敌人生命 +45%，攻击 +30%，初始压力 +12。',hp:1.45,attack:1.3,stress:12,gold:1.6,shards:1.6}
};

// V0.7: two mutually exclusive techniques for every original skill.
// A branch may be selected once the underlying skill reaches level 1.
export const SKILL_BRANCHES={
 cleave:[{id:'a',name:'破甲誓斩',desc:'忽略目标 3 点护甲',pierce:3},{id:'b',name:'沉重裁决',desc:'伤害倍率 +0.30',power:.30}],
 bulwark:[{id:'a',name:'永恒壁垒',desc:'守护持续时间 +2',duration:2},{id:'b',name:'宁静壁垒',desc:'额外减轻自身 12 压力',relief:12}],
 crush:[{id:'a',name:'震慑冲击',desc:'眩晕概率 +25%',chance:25},{id:'b',name:'碎盾冲击',desc:'忽略目标 3 点护甲',pierce:3}],
 snipe:[{id:'a',name:'鹰眼狙击',desc:'暴击概率 +15%',crit:15},{id:'b',name:'风暴箭矢',desc:'伤害倍率 +0.30',power:.30}],
 dagger:[{id:'a',name:'迅捷突袭',desc:'伤害倍率 +0.25',power:.25},{id:'b',name:'暗影追猎',desc:'命中后附加 2 回合标记',mark:2}],
 mark:[{id:'a',name:'狩猎仪式',desc:'标记持续时间 +2',duration:2},{id:'b',name:'虚弱印记',desc:'同时使敌人虚弱 2 回合',weak:2}],
 mend:[{id:'a',name:'深度缝合',desc:'额外恢复 8 生命',heal:8},{id:'b',name:'净化祷告',desc:'清除中毒和流血',cleanse:true}],
 scarlet:[{id:'a',name:'蔓延疫剂',desc:'中毒持续时间 +2',duration:2},{id:'b',name:'腐蚀浓缩',desc:'伤害倍率 +0.30',power:.30}],
 remedy:[{id:'a',name:'冷静配方',desc:'额外减少 15 压力',relief:15},{id:'b',name:'复苏药剂',desc:'额外回复 6 生命',heal:6}],
 cinder:[{id:'a',name:'穿甲烬火',desc:'忽略目标 3 点护甲',pierce:3},{id:'b',name:'烈焰爆发',desc:'伤害倍率 +0.30',power:.30}],
 hex:[{id:'a',name:'永蚀咒印',desc:'虚弱持续时间 +2',duration:2},{id:'b',name:'侵魂咒印',desc:'伤害倍率 +0.30',power:.30}],
 solace:[{id:'a',name:'深层慰藉',desc:'额外减少 15 压力',relief:15},{id:'b',name:'生命呢喃',desc:'同时治疗目标 6 生命',heal:6}],
 bloodlet:[{id:'a',name:'延续创伤',desc:'流血持续时间 +2',duration:2},{id:'b',name:'迅影割裂',desc:'伤害倍率 +0.30',power:.30}],
 puncture:[{id:'a',name:'透甲穿刺',desc:'忽略目标 4 点护甲',pierce:4},{id:'b',name:'命运刺击',desc:'暴击概率 +15%',crit:15}],
 taunt:[{id:'a',name:'深刻破绽',desc:'标记持续时间 +2',duration:2},{id:'b',name:'扰乱佯攻',desc:'同时使敌人虚弱 2 回合',weak:2}],
 scourge:[{id:'a',name:'深痕鞭笞',desc:'流血持续时间 +2',duration:2},{id:'b',name:'破甲鞭笞',desc:'忽略目标 3 点护甲',pierce:3}],
 atonement:[{id:'a',name:'虔诚救赎',desc:'额外减少 15 压力',relief:15},{id:'b',name:'苦难疗愈',desc:'同时治疗目标 6 生命',heal:6}],
 sacrifice:[{id:'a',name:'生命献祭',desc:'额外治疗 10 生命',heal:10},{id:'b',name:'无血契约',desc:'自身失去生命减少 4',selfDamageReduction:4}]
};
export const BRANCH_TRAINING_COST={gold:35,shards:3};
export function skillBranch(hero,skillId){return SKILL_BRANCHES[skillId]?.find(b=>b.id===hero?.skillBranches?.[skillId])||null;}
export function chooseSkillBranch(state,heroId,skillId,branchId){
 if(state.phase!=='camp')return false;ensureProgression(state);
 const hero=[...state.heroes,...state.reserveHeroes].find(h=>h.id===heroId);
 if(!hero||!CLASSES[hero.classId].skills.includes(skillId)||skillLevel(hero,skillId)<1)return false;
 const branch=SKILL_BRANCHES[skillId]?.find(b=>b.id===branchId);
 if(!branch||hero.skillBranches[skillId]===branchId)return false;
 const switching=Boolean(hero.skillBranches[skillId]);const cost=switching?{gold:22,shards:2}:BRANCH_TRAINING_COST;
 if(state.gold<cost.gold||state.shards<cost.shards)return false;
 state.gold-=cost.gold;state.shards-=cost.shards;hero.skillBranches[skillId]=branchId;
 state.history.unshift(`${hero.name} 选择了「${SKILLS[skillId].name}」分支：${branch.name}。`);return true;
}
export const TRINKET_SETS={
 sentinel:{name:'守墓誓约',pieces:['iron','seal'],mods:{armor:2,hp:4},effect:'进入战斗获得 1 回合守护'},
 twilight:{name:'暮影之猎',pieces:['fang','thorn'],mods:{attack:2,crit:4},effect:'提高攻击和暴击'},
 sacred:{name:'灰烬祷仪',pieces:['relic','bell'],mods:{healBonus:4,stressResist:8},effect:'开战前压力 -5'},
 pilgrim:{name:'孤灯旅人',pieces:['torch','feather'],mods:{speed:2,hp:3},effect:'提高速度与生命'}
};
export function activeTrinketSet(hero,state){
 if(!state?.items)return null;
 const bases=(hero.trinkets||[]).map(id=>state.items.find(i=>i.id===id)?.baseId).filter(Boolean);
 return Object.entries(TRINKET_SETS).find(([,set])=>set.pieces.every(base=>bases.includes(base)))?.[0]||null;
}
export const STATUS_LABELS={poison:'中毒',bleed:'流血',stun:'眩晕',weak:'虚弱'};
export function enemyResistances(type){
 const isUndead=['thrall','ghoul','guardian','wraith','bonearcher','banshee','boss'].includes(type);
 const isMire=['mireling','sporewitch','bogstalker','leech','bogcolossus','mirequeen'].includes(type);
 const isForge=['emberguard','slagbeast','cinderseer','smelter','ironreaver','forgeheart'].includes(type);
 const base={poison:10,bleed:10,stun:15,weak:5};
 if(isUndead){base.poison=55;base.bleed=0;}
 if(isMire){base.poison=65;base.bleed=5;}
 if(isForge){base.poison=0;base.bleed=40;base.stun=30;}
 if(BOSS_TYPES.includes(type)){base.stun=85;base.weak=30;}
 return base;
}
export function heroResistances(hero){return {poison:Math.min(60,8+Math.max(0,hero.armor||0)*3),bleed:Math.min(65,10+Math.max(0,hero.armor||0)*5),stun:10,weak:10};}
export function inflictStatus(state,target,status,chance=100,duration=2){
 if(!STATUS_LABELS[status]||target.hp<=0)return false;
 const resist=target.side==='enemy'?enemyResistances(target.type):heroResistances(target);
 const actual=clamp(chance-(resist[status]||0),0,100);
 if(integer(state,1,100)>actual){log(state.battle,`${target.name} 抵抗了${STATUS_LABELS[status]}（抗性 ${resist[status]||0}%）`,'system');return false;}
 target.statuses[status]=Math.max(target.statuses[status]||0,duration);
 log(state.battle,`${target.name} 受到${STATUS_LABELS[status]}影响`,'hurt');return true;
}
export function quirkTreatmentCost(state){return {gold:Math.max(16,38-buildingLevel(state,'chapel')*5),shards:2};}
export function treatNegativeTrait(state,heroId,traitId){
 if(state.phase!=='camp'||TRAITS[traitId]?.kind!=='negative')return false;ensureProgression(state);
 const hero=[...state.heroes,...state.reserveHeroes].find(h=>h.id===heroId),cost=quirkTreatmentCost(state);
 if(!hero?.traits.includes(traitId)||state.gold<cost.gold||state.shards<cost.shards)return false;
 state.gold-=cost.gold;state.shards-=cost.shards;hero.traits=hero.traits.filter(x=>x!==traitId);
 hero.maxHp=heroStats(hero,state).maxHp;hero.hp=Math.min(hero.hp,hero.maxHp);
 state.history.unshift(`${hero.name} 治愈了负面特质「${TRAITS[traitId].name}」。`);return true;
}
export function evolveTrait(state,hero,reason){
 // Only active heroes have a chance to change after an expedition. Use save-seeded RNG.
 const kind=reason==='victory'?'positive':'negative';
 const chance=reason==='victory'?23:reason==='retreat'?18:45;
 if(integer(state,1,100)>chance)return null;
 const possible=Object.keys(TRAITS).filter(id=>TRAITS[id].kind===kind&&!hero.traits.includes(id));
 if(!possible.length)return null;
 // Three-trait cap controls runaway stat inflation.
 if(hero.traits.length>=3){const removed=hero.traits.find(id=>TRAITS[id].kind===kind);
  if(!removed)return null;hero.traits=hero.traits.filter(id=>id!==removed);}
 const chosen=possible[integer(state,0,possible.length-1)];hero.traits.push(chosen);
 hero.maxHp=heroStats(hero,state).maxHp;hero.hp=Math.min(hero.hp,hero.maxHp);
 state.history.unshift(`${hero.name} ${kind==='positive'?'获得':'染上'}特质「${TRAITS[chosen].name}」。`);return chosen;
}
export function regionThreatLevel(state,regionId){return Math.min(4,1+Math.floor((state.regionVictories?.[regionId]||0)/3));}

// V0.8: tactical forecasts describe enemy attack tendencies, never promise exact targets.
export function enemyIntent(unit,battle){
 if(!unit||unit.side!=='enemy'||unit.hp<=0)return null;
 const type=unit.type;
 if(['boss','mirequeen','forgeheart'].includes(type)&&battle?.round%3===0)return {title:'群体威胁',detail:'预计下一次行动造成全队伤害与压力',level:'critical'};
 if(['cultist','wraith','banshee','herald'].includes(type))return {title:'精神侵蚀',detail:'倾向攻击后排或治疗者，提升压力',level:'warning'};
 if(['sporewitch','mirequeen','mireling','leech','alchemist'].includes(type))return {title:'毒素侵袭',detail:'可能施加中毒，优先保护脆弱角色',level:'warning'};
 if(['butcher'].includes(type))return {title:'撕裂重击',detail:'对前排造成高伤害，可能施加流血',level:'critical'};
 if(['bogcolossus','ironreaver','slagbeast'].includes(type))return {title:'前排重压',detail:'预计向前排发动强力物理攻击',level:'critical'};
 if(['bonearcher','cinderseer','smelter'].includes(type))return {title:'远程压制',detail:'可能袭击后排及低生命目标',level:'warning'};
 return {title:'近战攻击',detail:'倾向攻击前排，实际目标可能变化',level:'normal'};
}
export const V08_ROOMS={
 oracle:{title:'盲眼预言者',eyebrow:'特殊房间 · 命运占兆',desc:'白蜡封住了她的眼睛，但她依然知道每个人背负的名字。',choices:[
  {label:'交换一段痛苦记忆',hint:'全队压力 +6，获得遗物碎片 5–8',kind:'oracle-trade'},
  {label:'请求安抚与指引',hint:'支付 18 金币，全队压力 −15',kind:'oracle-calm'}]},
 caravan:{title:'断轮商队',eyebrow:'特殊房间 · 流亡旅商',desc:'满载着破损补给的车队停在断桥前，商人开出了危险却诱人的价码。',choices:[
  {label:'购买战地补给',hint:'支付 24 金币，获得火把 2、绷带 2',kind:'caravan-buy'},
  {label:'护送商队离开',hint:'小队承受少量压力，获得 20–34 金币',kind:'caravan-escort'}]}
};
export function expeditionSummary(state){
 const reports=Array.isArray(state.expeditionReports)?state.expeditionReports:[];
 return {total:reports.length,victories:reports.filter(r=>r.reason==='victory').length,
  gold:reports.reduce((n,r)=>n+(r.gold||0),0),shards:reports.reduce((n,r)=>n+(r.shards||0),0),
  averageGold:reports.length?Math.round(reports.reduce((n,r)=>n+(r.gold||0),0)/reports.length):0,
  reports:reports.slice(0,10)};
}

export const MAX_SKILL_LEVEL=2;
export const TRAITS={
 steadfast:{name:'意志坚定',kind:'positive',desc:'抗压 +10',mods:{stressResist:10}},
 keeneye:{name:'鹰眼',kind:'positive',desc:'命中 +6',mods:{accuracy:6}},
 hardy:{name:'体质强健',kind:'positive',desc:'最大生命 +6',mods:{hp:6}},
 furious:{name:'好斗',kind:'positive',desc:'攻击 +1',mods:{attack:1}},
 frail:{name:'脆弱',kind:'negative',desc:'最大生命 −4',mods:{hp:-4}},
 anxious:{name:'焦虑',kind:'negative',desc:'抗压 −8',mods:{stressResist:-8}},
 clumsy:{name:'笨拙',kind:'negative',desc:'命中 −5',mods:{accuracy:-5}},
 slow:{name:'迟钝',kind:'negative',desc:'速度 −1',mods:{speed:-1}}
};
export const CRISES={
 panic:{name:'恐惧',desc:'每次行动有 25% 的概率畏缩'},
 rage:{name:'狂怒',desc:'攻击增加 2，但命中降低 8'},
 despair:{name:'绝望',desc:'命中下降 12，受到的压力更高'}
};
export const SPECIAL_ROOMS={
 shrine:{title:'破晓的祭坛',eyebrow:'特殊房间 · 祭坛',desc:'祭坛盛放着长明的灰火，似乎可以净化疲惫的魂魄。',choices:[{label:'举行净化仪式',hint:'全队减压，但消耗遗物收益',kind:'purge'},{label:'搜寻祭坛底座',hint:'获得碎片并增加压力',kind:'shrine'}]},
 ambush:{title:'传来脚步声的回廊',eyebrow:'特殊房间 · 伏击',desc:'面前的门扉突然合上，阴影中却留下了一条逃生缝隙。',choices:[{label:'突围作战',hint:'遭遇额外精英战；胜利可获得精英战利品',kind:'ambush-fight'},{label:'借夜色绕行',hint:'全队压力 +8，保全资源',kind:'ambush-avoid'}]},
 cache:{title:'密封的遗物秘库',eyebrow:'特殊房间 · 秘库',desc:'墙后藏着远征者遗忘的密室，其中珍宝与机关同在。',choices:[{label:'破坏古老封印',hint:'稀有饰品并承受伤害',kind:'cache-loot'},{label:'拆解陷阱',hint:'获得金币及补给',kind:'cache-safe'}]}
};
export function skillLevel(hero,skillId){return Math.max(0,Math.min(MAX_SKILL_LEVEL,hero?.skillLevels?.[skillId]||0));}
export function skillTrainingCost(hero,skillId){const lv=skillLevel(hero,skillId);return {gold:24+lv*20,shards:2+lv*2};}
export function trainSkill(state,heroId,skillId){if(state.phase!=='camp')return false;ensureProgression(state);
 const hero=[...state.heroes,...state.reserveHeroes].find(h=>h.id===heroId);
 if(!hero||!CLASSES[hero.classId].skills.includes(skillId)||skillLevel(hero,skillId)>=MAX_SKILL_LEVEL)return false;
 const cost=skillTrainingCost(hero,skillId);if(state.gold<cost.gold||state.shards<cost.shards)return false;
 state.gold-=cost.gold;state.shards-=cost.shards;hero.skillLevels[skillId]++;
 state.history.unshift(`${hero.name} 训练了「${SKILLS[skillId].name}」至 ${hero.skillLevels[skillId]} 级。`);return true;}
export function selectDifficulty(state,id){if(state.phase!=='camp'||!DIFFICULTIES[id])return false;ensureProgression(state);state.selectedDifficulty=id;return true;}
function defaultTraits(hero){const ids=Object.keys(TRAITS);const positives=ids.filter(x=>TRAITS[x].kind==='positive'),negatives=ids.filter(x=>TRAITS[x].kind==='negative');
 let code=0;for(const ch of String(hero.id||hero.name||'a'))code=(code*31+ch.charCodeAt(0))>>>0;
 return [positives[code%positives.length],negatives[Math.floor(code/7)%negatives.length]];}
function assignHeroGrowth(hero){if(!Array.isArray(hero.traits)||hero.traits.some(id=>!TRAITS[id]))hero.traits=defaultTraits(hero);
 if(!hero.skillLevels||typeof hero.skillLevels!=='object')hero.skillLevels={};
 if(!hero.skillBranches||typeof hero.skillBranches!=='object')hero.skillBranches={};
 for(const [id,choice] of Object.entries(hero.skillBranches))if(!CLASSES[hero.classId].skills.includes(id)||!SKILL_BRANCHES[id]?.some(b=>b.id===choice)||hero.skillLevels[id]<1)delete hero.skillBranches[id];
 for(const id of CLASSES[hero.classId].skills)if(!Number.isInteger(hero.skillLevels[id])||hero.skillLevels[id]<0||hero.skillLevels[id]>MAX_SKILL_LEVEL)hero.skillLevels[id]=0;
 if(!CRISES[hero.crisis])hero.crisis=null;
 if(hero.afflicted&&hero.stress>=100&&!hero.crisis){let sum=0;for(const c of String(hero.id))sum+=c.charCodeAt(0);hero.crisis=Object.keys(CRISES)[sum%Object.keys(CRISES).length];}
 if(hero.stress<65){hero.afflicted=false;hero.crisis=null;}
 return hero;}

// V0.5 region-based dungeons. Keys are persisted; old V0.4 expeditions default to crypt.
export const REGIONS={
 crypt:{name:'暮影墓窟',en:'THE SUNKEN CRYPT',short:'墓窟',symbol:'♜',theme:'crypt',desc:'古老誓言与亡者同眠。亡灵、咒术和压力侵蚀。',hazard:'亡者低语：每第 3 回合，一名英雄受到额外压力。',goldMult:1,shardMult:1,
  enemies:['thrall','ghoul','cultist','guardian','bonearcher','wraith'],elite:['guardian','butcher','cultist'],boss:['boss','cultist','thrall'],eliteTrait:'fortified'},
 mire:{name:'腐潮沼泽',en:'THE BLIGHTED MIRE',short:'沼泽',symbol:'☣',theme:'mire',desc:'被瘴气腐蚀的湿地。毒素、孢子与蚀骨的低语。',hazard:'瘴气弥漫：每第 3 回合，一名英雄被施加中毒。',goldMult:1.2,shardMult:1.25,
  enemies:['mireling','sporewitch','bogstalker','leech','alchemist','banshee'],elite:['bogcolossus','sporewitch','leech'],boss:['mirequeen','sporewitch','mireling'],eliteTrait:'venomous'},
 forge:{name:'熔烬铸炉',en:'THE CINDER FORGE',short:'铸炉',symbol:'⚒',theme:'forge',desc:'沉睡的铸铁巨炉再度燃烧。高护甲与灼热的连击。',hazard:'余烬灼烧：每第 3 回合，全队受到少量伤害。',goldMult:1.4,shardMult:1.5,
  enemies:['emberguard','slagbeast','cinderseer','smelter','guardian','herald'],elite:['ironreaver','emberguard','cinderseer'],boss:['forgeheart','emberguard','smelter'],eliteTrait:'relentless'}
};
export const ELITE_TRAITS={
 fortified:{name:'铁甲精英',desc:'精英小队额外获得 2 点护甲'},
 venomous:{name:'腐毒精英',desc:'精英攻击有概率施加中毒'},
 relentless:{name:'狂热精英',desc:'精英小队攻击和速度提高'}
};
const BOSS_TYPES=['boss','mirequeen','forgeheart'];
const REGION_EVENTS={
 crypt:{title:'亡者的铭碑',eyebrow:'墓窟异闻',desc:'碑文上记录着逝者的姓名。刻痕仍未干透，石缝里有隐约的祈祷。',choices:[{label:'解读禁忌铭文',hint:'获得遗物碎片，全队承受压力',kind:'shrine'},{label:'向亡者致意',hint:'全队减少压力',kind:'leave'}]},
 mire:{title:'会呼吸的孢子林',eyebrow:'沼泽异闻',desc:'泥水下发出均匀的呼吸，发光的孢子围住了一口古老药箱。',choices:[{label:'采集发光孢子',hint:'获得遗物，但队伍会受伤',kind:'spore'},{label:'点燃驱瘴火把',hint:'消耗 1 支火把，全队降低压力',kind:'purify'}]},
 forge:{title:'熄灭的誓约熔炉',eyebrow:'铸炉异闻',desc:'一座半熄的熔炉仍在呼唤献祭。炉内漂浮着冷却的稀有金属。',choices:[{label:'重启锻造机关',hint:'获得遗物碎片，全队失去少量生命',kind:'smelt'},{label:'搜集余温火种',hint:'补充火把和少量金币',kind:'embers'}]}
};
export function regionOf(state){const id=state?.expedition?.region||state?.selectedRegion||'crypt';return REGIONS[id]?id:'crypt';}
export function selectRegion(state,id){if(state.phase!=='camp'||!REGIONS[id])return false;ensureProgression(state);state.selectedRegion=id;return true;}

// V0.4 settlement progression: additive data, compatible with schemaVersion 1 saves.
export const BUILDINGS={
 infirmary:{name:'战地医馆',en:'FIELD INFIRMARY',icon:'✚',desc:'治疗生命与压力的效果提高，治疗费用下降。',gold:45,shards:3,bonus:'每级疗伤 +8 生命 / +4 减压，费用 −2 金币'},
 chapel:{name:'烬火礼拜堂',en:'EMBER CHAPEL',icon:'✥',desc:'营地可为英雄减压，远征归来时帮助后备英雄恢复精神。',gold:45,shards:3,bonus:'每级祷告 +10 减压；后备英雄远征后 −6 压力'},
 workshop:{name:'遗物工坊',en:'RELIC WORKSHOP',icon:'⚒',desc:'锻造时减少金币消耗，保留已有武器与护甲等级。',gold:65,shards:4,bonus:'每级锻造消耗 −5 金币'},
 watchtower:{name:'守夜塔',en:'NIGHT WATCH',icon:'♜',desc:'出发携带额外火把，扩大下一段路线的侦察视野。',gold:50,shards:4,bonus:'每级远征额外 +1 火把，提前发现一层房间'}
};
export const MAX_BUILDING_LEVEL=3;
export const EXPEDITION_PLANS={
 cautious:{name:'谨慎行军',icon:'◈',desc:'额外携带 2 支火把和 1 条绷带，带回金币降低 15%。',goldMult:.85,shardMult:1,torches:2,bandages:1,stress:0},
 standard:{name:'标准远征',icon:'✧',desc:'正常物资和收益，适合探索新路线。',goldMult:1,shardMult:1,torches:0,bandages:0,stress:0},
 daring:{name:'孤注一掷',icon:'⚔',desc:'开局损失 2 支火把、全队 +10 压力；成功带回金币 +35%、碎片 +25%。',goldMult:1.35,shardMult:1.25,torches:-2,bandages:0,stress:10}
};
export const TALENTS={
 vigor:{name:'坚韧体魄',icon:'⬡',desc:'每级 +5 最大生命',max:2},
 might:{name:'锐锋训练',icon:'⚔',desc:'每级 +1 攻击',max:2},
 resolve:{name:'精神韧性',icon:'✶',desc:'每级 +5 抗压',max:2}
};
export function buildingLevel(state,id){return Math.max(0,Math.min(MAX_BUILDING_LEVEL,Number(state.buildings?.[id]||0)));}
export function buildingCost(state,id){const def=BUILDINGS[id];if(!def)return null;const lv=buildingLevel(state,id);
 return {gold:def.gold+30*lv,shards:def.shards+3*lv};}
export function upgradeBuilding(state,id){if(state.phase!=='camp'||!BUILDINGS[id])return false;ensureProgression(state);
 const lv=buildingLevel(state,id),cost=buildingCost(state,id);
 if(lv>=MAX_BUILDING_LEVEL||state.gold<cost.gold||state.shards<cost.shards)return false;
 state.gold-=cost.gold;state.shards-=cost.shards;state.buildings[id]=lv+1;
 state.history.unshift(`${BUILDINGS[id].name} 已升到 ${lv+1} 级。`);return true;}
export function campHealCost(state){return Math.max(12,20-buildingLevel(state,'infirmary')*2);}
export function campPrayerCost(state){return Math.max(9,17-buildingLevel(state,'chapel')*2);}
export function prayAtCamp(state,id){if(state.phase!=='camp')return false;ensureProgression(state);
 const h=[...state.heroes,...state.reserveHeroes].find(x=>x.id===id),cost=campPrayerCost(state);
 if(!h||h.stress<=0||state.gold<cost)return false;
 state.gold-=cost;addStress(h,-(24+buildingLevel(state,'chapel')*10));
 state.history.unshift(`${h.name} 在礼拜堂静心祷告。`);return true;}
export function selectExpeditionPlan(state,id){if(state.phase!=='camp'||!EXPEDITION_PLANS[id])return false;ensureProgression(state);
 state.expeditionPlan=id;return true;}
export function allocateTalent(state,id,talentId){if(state.phase!=='camp'||!TALENTS[talentId])return false;ensureProgression(state);
 const h=[...state.heroes,...state.reserveHeroes].find(x=>x.id===id);
 if(!h||h.talentPoints<=0||(h.talents[talentId]||0)>=TALENTS[talentId].max)return false;
 h.talentPoints--;h.talents[talentId]=(h.talents[talentId]||0)+1;
 h.maxHp=heroStats(h,state).maxHp;h.hp=Math.min(h.hp,h.maxHp);
 state.history.unshift(`${h.name} 掌握了${TALENTS[talentId].name}（${h.talents[talentId]}级）。`);return true;}

export const HERO_NAMES = ['伊莱恩','维尔','赛勒斯','莫拉'];

export const RECRUIT_NAMES=['莱希','乌诺','海泽尔','希恩','维克托','蕾娜','卡尔文','露西亚','艾斯塔','泰伦','米拉','诺拉','赛温','德林'];
export const MAX_RESERVES=6;
// Data-driven trinkets: item instance -> base + 1-2 affixes, equipped in two unique slots.
export const TRINKET_BASES={
  ash:{name:'残烬吊坠',icon:'✧',mods:{hp:3}},
  iron:{name:'锈铁护符',icon:'⬡',mods:{armor:1}},
  fang:{name:'亡兽利齿',icon:'⌁',mods:{attack:1}},
  bell:{name:'静默银铃',icon:'✶',mods:{stressResist:5}},
  feather:{name:'乌鸦羽饰',icon:'➤',mods:{speed:1}},
  relic:{name:'被遗忘的圣徽',icon:'✥',mods:{healBonus:2}},
  thorn:{name:'血蔷薇胸针',icon:'❖',mods:{crit:2}},
  mask:{name:'裂痕面具',icon:'◈',mods:{accuracy:3}},
  torch:{name:'长明火种',icon:'♨',mods:{stressResist:4,speed:1}},
  vial:{name:'炼金残液',icon:'✚',mods:{healBonus:4,hp:-2}},
  crown:{name:'破碎王冠',icon:'♛',mods:{attack:2,stressResist:-4}},
  seal:{name:'守墓人封蜡',icon:'❖',mods:{armor:1,accuracy:2}}
};
export const AFFIXES={
  keen:{name:'锋锐',mods:{attack:2}},
  steadfast:{name:'坚忍',mods:{hp:5}},
  guarded:{name:'守护',mods:{armor:1}},
  swift:{name:'迅捷',mods:{speed:1}},
  steady:{name:'精准',mods:{accuracy:4}},
  vicious:{name:'凶戾',mods:{crit:3}},
  calm:{name:'宁静',mods:{stressResist:6}},
  merciful:{name:'慈悲',mods:{healBonus:3}},
  cursed:{name:'受诅咒的',mods:{attack:3,stressResist:-8}},
  reckless:{name:'鲁莽的',mods:{crit:5,armor:-1}},
  ritual:{name:'仪式的',mods:{healBonus:4,speed:-1}},
  twilight:{name:'黄昏的',mods:{hp:7,accuracy:-3}}
};
export const MOD_LABELS={attack:'攻击',hp:'生命',armor:'护甲',speed:'速度',accuracy:'命中',crit:'暴击率',stressResist:'抗压',healBonus:'治疗'};
export const RARITY_NAMES={common:'普通',rare:'稀有',epic:'史诗'};
export function trinketMods(item){const mods={};if(!item)return mods;
 const sources=[TRINKET_BASES[item.baseId],...(item.affixes||[]).map(id=>AFFIXES[id])];
 for(const source of sources)for(const [key,value] of Object.entries(source?.mods||{}))mods[key]=(mods[key]||0)+value;
 return mods;
}
export function trinketName(item){const base=TRINKET_BASES[item?.baseId];return `${(item?.affixes||[]).map(id=>AFFIXES[id]?.name).filter(Boolean).join('·')}${base?.name||'未知饰品'}`;}
export function ownedTrinketIds(state){return new Set([...state.heroes,...(state.reserveHeroes||[])].flatMap(h=>h.trinkets||[]).filter(Boolean));}
export function makeTrinket(state,rarity){const bases=Object.keys(TRINKET_BASES),affixes=Object.keys(AFFIXES);const roll=rarity||(['common','common','common','rare','rare','epic'][integer(state,0,5)]);
 const slots=roll==='epic'?3:roll==='rare'?2:1;const selected=[];
 while(selected.length<slots){const affix=affixes[integer(state,0,affixes.length-1)];if(!selected.includes(affix))selected.push(affix);}
 const id=state.nextItemId??1;state.nextItemId=id+1;
 return {id:`trinket-${id}`,baseId:bases[integer(state,0,bases.length-1)],affixes:selected,rarity:roll};
}
export function awardTrinket(state,rarity){if(!state.expedition)return null;state.expedition.lootItems??=[];
 const item=makeTrinket(state,rarity);state.expedition.lootItems.push(item);state.history.unshift(`找到饰品：${trinketName(item)}`);return item;
}
export function recruitOffers(state){const classes=Object.keys(CLASSES);return Array.from({length:3},()=>({classId:classes[integer(state,0,classes.length-1)],name:RECRUIT_NAMES[integer(state,0,RECRUIT_NAMES.length-1)]}));}
export function ensureProgression(state){if(!Array.isArray(state.reserveHeroes))state.reserveHeroes=[];if(!Array.isArray(state.items))state.items=[];
 if(typeof state.tutorialSeen!=='boolean')state.tutorialSeen=true; // legacy players have already learned the basics
 unlockAchievements(state);
 if(!Array.isArray(state.expeditionReports))state.expeditionReports=[];
 if(!Number.isInteger(state.defeatStreak)||state.defeatStreak<0)state.defeatStreak=0;
 if(!state.buildings||typeof state.buildings!=='object')state.buildings={};
 for(const id of Object.keys(BUILDINGS))if(!Number.isInteger(state.buildings[id])||state.buildings[id]<0||state.buildings[id]>MAX_BUILDING_LEVEL)state.buildings[id]=0;
 if(!EXPEDITION_PLANS[state.expeditionPlan])state.expeditionPlan='standard';
 if(!REGIONS[state.selectedRegion])state.selectedRegion='crypt';
 if(!DIFFICULTIES[state.selectedDifficulty])state.selectedDifficulty='pilgrim';
 if(state.expedition&&!DIFFICULTIES[state.expedition.difficulty])state.expedition.difficulty='pilgrim';
 if(state.battle&&!DIFFICULTIES[state.battle.difficulty])state.battle.difficulty=state.expedition?.difficulty||'pilgrim';
 if(!state.regionVictories||typeof state.regionVictories!=='object')state.regionVictories={};
 for(const id of Object.keys(REGIONS))if(!Number.isInteger(state.regionVictories[id])||state.regionVictories[id]<0)state.regionVictories[id]=0;
 if(state.expedition&&!REGIONS[state.expedition.region])state.expedition.region='crypt';
 if(state.battle){if(!REGIONS[state.battle.region])state.battle.region=state.expedition?.region||'crypt';
   if(!Number.isInteger(state.battle.bossPhase))state.battle.bossPhase=1;}
 
 for(const hero of [...state.heroes,...state.reserveHeroes]){
  assignHeroGrowth(hero);
  if(!hero.talents||typeof hero.talents!=='object')hero.talents={};
  for(const id of Object.keys(TALENTS))if(!Number.isInteger(hero.talents[id])||hero.talents[id]<0||hero.talents[id]>TALENTS[id].max)hero.talents[id]=0;
  if(!Number.isInteger(hero.talentPoints)||hero.talentPoints<0)hero.talentPoints=Math.max(0,(hero.level||1)-1-Object.values(hero.talents).reduce((a,b)=>a+b,0));
 }
 if(!Number.isInteger(state.nextItemId))state.nextItemId=1+Math.max(0,...state.items.map(item=>Number(item.id?.split('-').at(-1))||0));
 if(!Number.isInteger(state.nextHeroId))state.nextHeroId=1+Math.max(3,...[...state.heroes,...state.reserveHeroes].map(hero=>Number(hero.id?.split('-').at(-1))||0));
 for(const hero of [...state.heroes,...state.reserveHeroes])if(!Array.isArray(hero.trinkets))hero.trinkets=[null,null];
 if(!Array.isArray(state.recruits))state.recruits=state.phase==='camp'?recruitOffers(state):[];
 if(state.expedition&&!Array.isArray(state.expedition.lootItems))state.expedition.lootItems=[];
 return state;
}
export function hireRecruit(state,index){if(state.phase!=='camp')return false;ensureProgression(state);
 if(!Number.isInteger(index)||index<0||index>=state.recruits.length||state.reserveHeroes.length>=MAX_RESERVES)return false;
 const cost=65;if(state.gold<cost)return false;const offer=state.recruits[index],c=CLASSES[offer.classId];if(!c)return false;
 state.gold-=cost;const id=`hero-${state.nextHeroId++}`;
 state.reserveHeroes.push({id,classId:offer.classId,name:offer.name,rank:0,level:1,xp:0,hp:c.maxHp,maxHp:c.maxHp,stress:integer(state,3,13),afflicted:false,gear:{weapon:0,armor:0},talentPoints:0,talents:{vigor:0,might:0,resolve:0},trinkets:[null,null]});
 assignHeroGrowth(state.reserveHeroes.at(-1));const hire=state.reserveHeroes.at(-1);hire.maxHp=heroStats(hire,state).maxHp;hire.hp=hire.maxHp;state.recruits.splice(index,1);state.history.unshift(`${offer.name}（${c.name}）加入了后备队。`);return true;
}
export function swapHero(state,activeId,reserveId){if(state.phase!=='camp')return false;ensureProgression(state);
 const activeIdx=state.heroes.findIndex(h=>h.id===activeId),reserveIdx=state.reserveHeroes.findIndex(h=>h.id===reserveId);
 if(activeIdx<0||reserveIdx<0)return false;
 const active=state.heroes[activeIdx],reserve=state.reserveHeroes[reserveIdx];
 reserve.rank=active.rank;active.rank=0;state.heroes[activeIdx]=reserve;state.reserveHeroes[reserveIdx]=active;
 state.history.unshift(`${reserve.name} 被编入远征小队，${active.name} 前往后备队。`);return true;
}
export function dismissReserve(state,id){if(state.phase!=='camp')return false;ensureProgression(state);
 const index=state.reserveHeroes.findIndex(h=>h.id===id);if(index<0)return false;
 state.reserveHeroes.splice(index,1);state.history.unshift('一位后备英雄离开了营地。');return true;
}
export function equipTrinket(state,heroId,itemId,slot){if(state.phase!=='camp'||![0,1].includes(slot))return false;ensureProgression(state);
 const hero=[...state.heroes,...state.reserveHeroes].find(h=>h.id===heroId),item=state.items.find(item=>item.id===itemId);
 if(!hero||!item||ownedTrinketIds(state).has(itemId))return false;
 hero.trinkets[slot]=itemId;hero.maxHp=heroStats(hero,state).maxHp;hero.hp=Math.min(hero.hp,hero.maxHp);
 return true;
}
export function unequipTrinket(state,heroId,slot){if(state.phase!=='camp'||![0,1].includes(slot))return false;ensureProgression(state);
 const hero=[...state.heroes,...state.reserveHeroes].find(h=>h.id===heroId);if(!hero||!hero.trinkets[slot])return false;
 hero.trinkets[slot]=null;hero.maxHp=heroStats(hero,state).maxHp;hero.hp=Math.min(hero.hp,hero.maxHp);return true;
}
export function salvageTrinket(state,itemId){if(state.phase!=='camp')return false;ensureProgression(state);
 const index=state.items.findIndex(item=>item.id===itemId);if(index<0||ownedTrinketIds(state).has(itemId))return false;
 const [item]=state.items.splice(index,1),reward=item.rarity==='epic'?8:item.rarity==='rare'?4:2;
 state.shards+=reward;state.history.unshift(`分解${trinketName(item)}，获得 ${reward} 遗物碎片。`);return true;
}

export function random(state){ let x = (state.rngState >>> 0) || 42; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; state.rngState = x >>> 0; return (state.rngState >>> 0) / 4294967296; }
export function integer(state, min, max){return Math.floor(random(state)*(max-min+1))+min;}
export function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
// V1.0 achievements are earned from actual campaign state; no external account required.
export const ACHIEVEMENTS={
 first:{name:'踏入黑暗',desc:'完成首次远征',check:s=>s.expeditions>=1},
 steady:{name:'不屈远征者',desc:'累计完成 5 次远征',check:s=>s.expeditions>=5},
 seasoned:{name:'百炼成钢',desc:'累计完成 15 次远征',check:s=>s.expeditions>=15},
 crypt:{name:'墓窟破晓',desc:'击败暮影墓窟首领',check:s=>(s.regionVictories?.crypt||0)>=1},
 mire:{name:'斩断腐根',desc:'击败腐潮沼泽首领',check:s=>(s.regionVictories?.mire||0)>=1},
 forge:{name:'熄灭炉心',desc:'击败熔烬铸炉首领',check:s=>(s.regionVictories?.forge||0)>=1},
 three:{name:'三地凯歌',desc:'三个地牢均取得首胜',check:s=>['crypt','mire','forge'].every(id=>(s.regionVictories?.[id]||0)>0)},
 recruits:{name:'众志成城',desc:'拥有至少两名后备英雄',check:s=>(s.reserveHeroes?.length||0)>=2},
 architect:{name:'营地复兴',desc:'任意建筑达到三级',check:s=>Object.values(s.buildings||{}).some(lv=>lv>=3)},
 mastery:{name:'技艺臻熟',desc:'至少一个技能达到二级',check:s=>[...s.heroes,...(s.reserveHeroes||[])].some(h=>Object.values(h.skillLevels||{}).some(lv=>lv>=2))},
 collector:{name:'遗物守护者',desc:'持有至少十件饰品',check:s=>(s.items?.length||0)>=10},
 veteran:{name:'幸存者',desc:'拥有一名五级英雄',check:s=>[...s.heroes,...(s.reserveHeroes||[])].some(h=>h.level>=5)}
};
export function unlockAchievements(state){
 if(!state.achievements||typeof state.achievements!=='object'||Array.isArray(state.achievements))state.achievements={};
 const unlocked=[];
 for(const [id,record] of Object.entries(ACHIEVEMENTS))if(!state.achievements[id]&&record.check(state)){
  state.achievements[id]=state.day||1;unlocked.push(id);
 }
 return unlocked;
}
export function freshGame(seed=Date.now()){
  const state = {schemaVersion:VERSION, seed:seed>>>0, rngState:(seed>>>0)||42, phase:'camp', day:1, expeditions:0, gold:145, shards:8, buildings:{infirmary:0,chapel:0,workshop:0,watchtower:0}, selectedRegion:'crypt',selectedDifficulty:'pilgrim',regionVictories:{crypt:0,mire:0,forge:0}, expeditionPlan:'standard', expeditionReports:[], defeatStreak:0, achievements:{}, tutorialSeen:false, supplies:{torches:5,bandages:2}, heroes:[], reserveHeroes:[], recruits:[], items:[], nextItemId:1, nextHeroId:4, expedition:null, battle:null, event:null, result:null, history:['营地的篝火重新燃起。灰烬之下，还有誓言。'], createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()};
  Object.entries(CLASSES).slice(0,4).forEach(([id,c],i)=>{state.heroes.push({id:`hero-${i}`,classId:id,name:HERO_NAMES[i],rank:i+1,level:1,xp:0,hp:c.maxHp,maxHp:c.maxHp,stress:integer(state,3,12),afflicted:false,gear:{weapon:0,armor:0},talentPoints:0,talents:{vigor:0,might:0,resolve:0},trinkets:[null,null]});});
  state.heroes.forEach(h=>{assignHeroGrowth(h);h.maxHp=heroStats(h,state).maxHp;h.hp=h.maxHp;});state.recruits=recruitOffers(state);return state;
}
export function heroStats(hero,state=null){const c=CLASSES[hero.classId],bonus=(hero.level-1)*4;
 const totals={attack:0,armor:0,hp:0,speed:0,accuracy:0,crit:0,stressResist:0,healBonus:0};
 for(const traitId of hero.traits||[])for(const [key,val] of Object.entries(TRAITS[traitId]?.mods||{}))totals[key]=(totals[key]||0)+val;
 if(hero.crisis==='rage'){totals.attack+=2;totals.accuracy-=8;}
 if(hero.crisis==='despair')totals.accuracy-=12;
 totals.hp+=(hero.talents?.vigor||0)*5;totals.attack+=(hero.talents?.might||0);totals.stressResist+=(hero.talents?.resolve||0)*5;
 if(state?.items)for(const id of hero.trinkets||[]){const item=state.items.find(t=>t.id===id);if(item)for(const [key,value] of Object.entries(trinketMods(item)))totals[key]=(totals[key]||0)+value;}
 const set=TRINKET_SETS[activeTrinketSet(hero,state)];if(set)for(const [key,value] of Object.entries(set.mods))totals[key]=(totals[key]||0)+value;
 return {...c,maxHp:Math.max(1,c.maxHp+bonus+((hero.gear?.armor||0)*3)+totals.hp),attack:c.attack+(hero.level-1)*2+((hero.gear?.weapon||0)*2)+totals.attack,armor:c.armor+(hero.gear?.armor||0)+totals.armor,speed:c.speed+totals.speed,accuracyBonus:totals.accuracy,critBonus:totals.crit,stressResist:totals.stressResist,healBonus:totals.healBonus};}

export function makeDungeon(state){
  const cols=[[-1,0,1],[-1,0,1],[-1,0,1],[-1,0,1],[0]];
  const types=['battle','battle','event','treasure','rest','supply','shrine','ambush','cache','oracle','caravan'];
  let nodes=[];
  for(let layer=0;layer<5;layer++){
    const rows=cols[layer];for(const row of rows){
      let kind=layer===4?'boss':types[integer(state,0,types.length-1)];
      if(layer===0) kind=['battle','event','treasure'][row+1];
      if(layer===3 && row===0)kind='elite';
      nodes.push({id:`${layer}-${row}`,layer,row,type:kind,visited:false});
    }
  }
  return {region:state.selectedRegion||'crypt',difficulty:state.selectedDifficulty||'pilgrim',nodes,layer:-1,row:0,visited:[],roomsCleared:0,lootGold:0,lootShards:0,lootItems:[],torch:state.supplies.torches,bandages:state.supplies.bandages};
}
export function beginExpedition(state){
  if(state.phase!=='camp')return false;ensureProgression(state);
  if(state.heroes.every(h=>h.hp<=0))return false;
  state.expedition=makeDungeon(state);const plan=EXPEDITION_PLANS[state.expeditionPlan],difficulty=DIFFICULTIES[state.selectedDifficulty];
 state.expedition.plan=state.expeditionPlan;
 state.expedition.torch=Math.max(0,state.expedition.torch+plan.torches+buildingLevel(state,'watchtower'));
 state.expedition.bandages+=plan.bandages;
 if(plan.stress||difficulty.stress)state.heroes.filter(h=>h.hp>0).forEach(h=>addStress(h,plan.stress+difficulty.stress));
 state.battle=null;state.event=null;state.result=null;state.phase='map';state.history.unshift('远征开始。薄雾吞没了营地的灯火。');return true;
}
export function reachableNodes(state){ if(!state.expedition)return [];
 const ex=state.expedition;return ex.nodes.filter(n=>n.layer===ex.layer+1 && (ex.layer===-1 || n.layer===4 || Math.abs(n.row-ex.row)<=1));
}
export function enterNode(state,id){
 if(state.phase!=='map')return false;
 const node=reachableNodes(state).find(n=>n.id===id);if(!node)return false;
 const ex=state.expedition;ex.layer=node.layer;ex.row=node.row;ex.visited.push(node.id);node.visited=true;ex.roomsCleared++;
 if(ex.torch>0)ex.torch--; else state.heroes.filter(h=>h.hp>0).forEach(h=>addStress(h,8));
 if(['battle','elite','boss'].includes(node.type)){beginBattle(state,node.type);return true;}
 const events={
   event:{title:'碎裂的祷告',eyebrow:'未知事件',desc:'石壁上刻着一些早已被遗忘的名字。每个名字的末尾，都有一道新鲜的血痕。',choices:[{label:'触摸刻痕',hint:'获得遗物，但小队增加压力',kind:'shrine'},{label:'静静离开',hint:'减轻小队压力',kind:'leave'}]},
   treasure:{title:'被遗忘的供箱',eyebrow:'战利品',desc:'一口沾满灰烬的铁箱倚靠在残缺的石柱下。锁已经生锈，箱内却传来金属摩擦声。',choices:[{label:'撬开铁箱',hint:'获得大量金币，可能受伤',kind:'chest'},{label:'谨慎搜寻',hint:'获得少量金币与遗物',kind:'search'}]},
   rest:{title:'灰烬篝火',eyebrow:'休整之地',desc:'角落里还留着一簇微弱的火光。火焰不算温暖，但足够令疲惫的旅人忆起故乡。',choices:[{label:'包扎伤口',hint:'全队恢复生命',kind:'heal'},{label:'围火交谈',hint:'全队降低压力',kind:'rest'}]},
   supply:{title:'遗落的补给',eyebrow:'资源发现',desc:'废弃营帐中仍有一些能用的物资。曾经的主人已经不需要它们了。',choices:[{label:'搜集火把',hint:'火把 +3',kind:'torch'},{label:'取走绷带',hint:'绷带 +2',kind:'bandage'}]}
 };
 state.event=node.type==='event'?structuredClone(REGION_EVENTS[regionOf(state)]||REGION_EVENTS.crypt):V08_ROOMS[node.type]?structuredClone(V08_ROOMS[node.type]):SPECIAL_ROOMS[node.type]?structuredClone(SPECIAL_ROOMS[node.type]):events[node.type];
 if(node.type==='event'&&regionOf(state)==='mire'&&ex.torch<=0){state.event.choices[1]={label:'后退并屏住呼吸',hint:'全队压力降低 5 点',kind:'leave-mire'};}
 state.phase='event';return true;
}
export function resolveEvent(state,kind){if(state.phase!=='event')return false;const ex=state.expedition;const living=state.heroes.filter(h=>h.hp>0);
 let detail='';switch(kind){
 case 'oracle-trade':living.forEach(h=>addStress(h,6));ex.lootShards+=integer(state,5,8);detail='预言者取走了痛苦回忆，留下古老碎片。';break;
 case 'oracle-calm':if(state.gold<18)return false;state.gold-=18;living.forEach(h=>addStress(h,-15));detail='预言者的低语暂时抚平了队伍的伤痛。';break;
 case 'caravan-buy':if(state.gold<24)return false;state.gold-=24;ex.torch+=2;ex.bandages+=2;detail='从流亡商人手中买下了急需的补给。';break;
 case 'caravan-escort':living.forEach(h=>addStress(h,4));ex.lootGold+=integer(state,20,34);detail='护送商队离开险地，商人支付了报酬。';break;
 case 'purge':living.forEach(h=>addStress(h,-22));ex.lootShards=Math.max(0,ex.lootShards-2);detail='灰火为旅人清除了心头阴影。';break;
 case 'ambush-avoid':living.forEach(h=>addStress(h,8));detail='队伍在阴影中绕过了伏击。';break;
 case 'ambush-fight':state.event=null;beginBattle(state,'elite');state.history.unshift('你选择了强行突围！');return true;
 case 'cache-loot':awardTrinket(state,'rare');living.forEach(h=>h.hp=Math.max(1,h.hp-5));detail='古老秘库中找到一件稀有饰品。';break;
 case 'cache-safe':ex.lootGold+=integer(state,20,36);ex.torch+=1;detail='拆解机关后，你取得了补给与旧币。';break;
 case 'shrine':ex.lootShards+=integer(state,3,6);living.forEach(h=>addStress(h,13));detail='诅咒的遗物落入你的掌心。';break;
 case 'leave':living.forEach(h=>h.stress=clamp(h.stress-8,0,120));detail='你选择不惊醒过去。';break;
 case 'chest':{ex.lootGold+=integer(state,36,65);awardTrinket(state);const unlucky=living[integer(state,0,living.length-1)];if(unlucky)unlucky.hp=Math.max(1,unlucky.hp-4);detail='铁箱被打开，机关在黑暗中鸣响。';break;}
 case 'search':ex.lootGold+=integer(state,13,26);ex.lootShards+=2;if(integer(state,1,100)<=45)awardTrinket(state);detail='谨慎的搜索取得了回报。';break;
 case 'heal':living.forEach(h=>h.hp=clamp(h.hp+Math.floor(h.maxHp*.3),0,h.maxHp));detail='伤口在火光下得到处理。';break;
 case 'rest':living.forEach(h=>h.stress=clamp(h.stress-21,0,120));detail='短暂的宁静令队伍重新振作。';break;
 case 'torch':ex.torch+=3;detail='火光再度延伸向地牢深处。';break;
 case 'bandage':ex.bandages+=2;detail='收集到了急救用品。';break;
 case 'spore':ex.lootShards+=integer(state,4,7);living.forEach(h=>{h.hp=Math.max(1,h.hp-5);addStress(h,3)});detail='采集孢子时，瘴气烧灼了整支队伍。';break;
 case 'leave-mire':living.forEach(h=>addStress(h,-5));detail='你屏住呼吸从孢子林撤离。';break;
 case 'purify':if(ex.torch<=0)return false;ex.torch--;living.forEach(h=>addStress(h,-12));detail='火把化作净化的火焰，驱散了孢子。';break;
 case 'smelt':ex.lootShards+=integer(state,5,9);living.forEach(h=>h.hp=Math.max(1,h.hp-6));detail='炉门开启时的热浪夺走了生命，却也吐出遗物。';break;
 case 'embers':ex.torch+=2;ex.lootGold+=integer(state,6,14);detail='你从炉灰里找到了火种和旧币。';break;
 default:return false;
 }
 state.history.unshift(detail);state.event=null;state.phase='map';return true;
}
export function addStress(hero,value){const prev=hero.stress;const extra=value>0&&hero.crisis==='despair'?2:0;hero.stress=clamp(hero.stress+value+extra,0,120);
 if(prev<100&&hero.stress>=100){hero.afflicted=true;const ids=Object.keys(CRISES);let checksum=0;for(const c of String(hero.id))checksum+=c.charCodeAt(0);hero.crisis=ids[checksum%ids.length];
  if(hero.side==='hero'){if(hero.crisis==='rage'){hero.attack+=2;hero.accuracyBonus=(hero.accuracyBonus||0)-8;}else if(hero.crisis==='despair')hero.accuracyBonus=(hero.accuracyBonus||0)-12;}}
 if(hero.stress<65){if(hero.side==='hero'&&hero.afflicted){if(hero.crisis==='rage'){hero.attack-=2;hero.accuracyBonus=(hero.accuracyBonus||0)+8;}else if(hero.crisis==='despair')hero.accuracyBonus=(hero.accuracyBonus||0)+12;}hero.afflicted=false;hero.crisis=null;}
}
export function createEnemy(state,type,rank){const e=ENEMIES[type];return {id:`enemy-${rank}-${integer(state,100,999)}`,type,name:e.name,rank,maxHp:e.maxHp,hp:e.maxHp,attack:e.attack,speed:e.speed,armor:e.armor,stress:0,statuses:{},side:'enemy'};}
export function beginBattle(state,kind='battle'){
 const regionId=regionOf(state),region=REGIONS[regionId];
 const pool=kind==='elite'?region.elite:region.enemies;
 const types=kind==='boss'?region.boss:kind==='elite'?region.elite:Array.from({length:integer(state,2,3)},()=>pool[integer(state,0,pool.length-1)]);
 const enemies=types.map((t,i)=>createEnemy(state,t,i+1));
 const threatLevel=regionThreatLevel(state,regionId);
 const trait=kind==='elite'?region.eliteTrait:null;
 if(trait==='fortified')enemies.forEach(e=>e.armor+=2);
 if(trait==='relentless')enemies.forEach(e=>{e.attack+=2;e.speed+=2});
 const difficulty=DIFFICULTIES[state.expedition?.difficulty]||DIFFICULTIES.pilgrim;
 enemies.forEach(e=>{e.maxHp=Math.ceil(e.maxHp*difficulty.hp*(1+.07*(threatLevel-1)));e.hp=e.maxHp;e.attack=Math.ceil(e.attack*difficulty.attack*(1+.045*(threatLevel-1)))});
 const heroes=state.heroes.filter(h=>h.hp>0).sort((a,b)=>a.rank-b.rank).map((h,i)=>({...h,rank:i+1,side:'hero',attack:heroStats(h,state).attack,speed:heroStats(h,state).speed,armor:heroStats(h,state).armor,accuracyBonus:heroStats(h,state).accuracyBonus,critBonus:heroStats(h,state).critBonus,healBonus:heroStats(h,state).healBonus,stressResist:heroStats(h,state).stressResist,statuses:{}}));
 for(const h of heroes){const setId=activeTrinketSet(h,state);if(setId==='sentinel')h.statuses.guard=2;if(setId==='sacred'){h.stress=Math.max(0,h.stress-5);const original=state.heroes.find(x=>x.id===h.id);if(original)original.stress=h.stress;}}
 state.battle={kind,region:regionId,difficulty:state.expedition?.difficulty||'pilgrim',threatLevel,trait,bossPhase:1,round:0,heroes,enemies,order:[],turnIndex:0,activeId:null,selectedSkill:null,logs:[{text:kind==='boss'?'古老的誓言正在苏醒。':'敌意自阴影中缓缓浮现。',type:'system'}],finished:false};state.phase='battle';advanceTurn(state);
}
function living(list){return list.filter(u=>u.hp>0).sort((a,b)=>a.rank-b.rank);}
export function currentActor(state){const b=state.battle;return b?[...b.heroes,...b.enemies].find(u=>u.id===b.activeId):null;}
export function validTargets(b,actor,skill){const allies=actor.side==='hero'?b.heroes:b.enemies, enemies=actor.side==='hero'?b.enemies:b.heroes;
 if(skill.side==='self')return [actor];
 const members=skill.side==='ally'?allies:enemies;
 return living(members).filter(u=>skill.targets.includes(u.rank));
}
function log(b,text,type='normal'){b.logs.unshift({text,type});if(b.logs.length>24)b.logs.length=24;}
function compressRanks(b){for(const group of [b.heroes,b.enemies]) living(group).forEach((u,i)=>u.rank=i+1);}
function endCheck(state){const b=state.battle;if(!b)return true;
 if(!living(b.enemies).length){const bonus=b.kind==='boss'?110:b.kind==='elite'?55:integer(state,18,35);state.expedition.lootGold+=bonus;state.expedition.lootShards+=b.kind==='boss'?12:b.kind==='elite'?4:integer(state,0,2);if(b.kind==='boss')awardTrinket(state,'epic');else if(b.kind==='elite')awardTrinket(state,'rare');else if(integer(state,1,100)<=25)awardTrinket(state);b.finished=true;syncHeroes(state);
 if(b.kind==='boss'){finishExpedition(state,'victory');} else {state.phase='map';state.battle=null;state.history.unshift(`战斗获胜，收获 ${bonus} 枚金币。`);}return true;}
 if(!living(b.heroes).length){syncHeroes(state);finishExpedition(state,'defeat');return true;}
 return false;
}
function syncHeroes(state){const b=state.battle;if(!b)return;for(const u of b.heroes){const hero=state.heroes.find(h=>h.id===u.id);if(hero){hero.hp=u.hp;hero.stress=u.stress;hero.afflicted=u.afflicted||false;hero.crisis=u.crisis||null;}}}
function roundOrder(state){const b=state.battle;b.round++;
 const alive=living(b.heroes),id=b.region||'crypt';
 if(b.round>1&&b.round%3===0&&alive.length){
  if(id==='mire'){const target=alive[integer(state,0,alive.length-1)];target.statuses.poison=Math.max(2,target.statuses.poison||0);log(b,`腐潮瘴气侵袭 ${target.name}，施加中毒`,'hurt');}
  else if(id==='forge'){for(const h of alive){h.hp=Math.max(1,h.hp-3)}log(b,'炽热的熔炉爆发：存活英雄受到 3 点灼烧伤害','hurt');}
  else{const target=alive[integer(state,0,alive.length-1)];addStress(target,7);log(b,`亡者的低语令 ${target.name} 增加 7 点压力`,'hurt');}
 }
 b.order=[...living(b.heroes),...living(b.enemies)].map(u=>({id:u.id,initiative:u.speed+integer(state,0,4)})).sort((a,c)=>c.initiative-a.initiative).map(x=>x.id);b.turnIndex=0;log(b,`第 ${b.round} 回合 · 阴影涌动`,'round');}
export function advanceTurn(state){const b=state.battle;if(!b||state.phase!=='battle')return;
 for(let safety=0;safety<60;safety++){
  if(endCheck(state))return;
  if(b.turnIndex>=b.order.length){roundOrder(state);}
  const id=b.order[b.turnIndex++],unit=[...b.heroes,...b.enemies].find(u=>u.id===id);if(!unit||unit.hp<=0)continue;
  b.activeId=id;b.selectedSkill=null;
  let dot=0;if(unit.statuses.poison>0){dot+=4;unit.statuses.poison--;log(b,`${unit.name} 受到 4 点毒素伤害`,'hurt');}
  if(unit.statuses.bleed>0){dot+=3;unit.statuses.bleed--;log(b,`${unit.name} 受到 3 点流血伤害`,'hurt');}
  unit.hp=Math.max(0,unit.hp-dot);if(unit.hp<=0){log(b,`${unit.name} 倒下了`,'hurt');compressRanks(b);continue;}
  if(unit.statuses.guard>0)unit.statuses.guard--;
  if(unit.statuses.mark>0)unit.statuses.mark--;
  if(unit.statuses.weak>0)unit.statuses.weak--;
  if(unit.statuses.stun>0){unit.statuses.stun--;log(b,`${unit.name} 被眩晕，失去行动机会`,'system');continue;}
  if(unit.side==='hero'){
    if(unit.afflicted&&unit.crisis==='panic'&&integer(state,1,100)<=25){log(b,`${unit.name} 因恐惧而畏缩，失去行动`,'hurt');continue;}
    return;
  }
  enemyAct(state,unit);if(endCheck(state))return;
 }
 // Safety fallback prevents pathological loops caused by corrupted save data.
 b.activeId=null;log(b,'战斗序列已重置。','system');roundOrder(state);
}
function damage(state,source,target,power,options={}){const b=state.battle;const spread=integer(state,-2,2);let amount=Math.max(1,Math.round(source.attack*power+spread-Math.max(0,target.armor-(options.pierce||0))));if(target.statuses.guard>0)amount=Math.max(1,Math.floor(amount*.55));if(target.statuses.mark>0)amount=Math.round(amount*1.3);if(source.statuses.weak>0)amount=Math.max(1,Math.round(amount*.65));
 const crit=integer(state,1,100)<=9+(source.critBonus||0)+(options.crit||0);if(crit)amount=Math.round(amount*1.5);target.hp=Math.max(0,target.hp-amount);if(b.trait==='venomous'&&source.side==='enemy'&&target.side==='hero'&&target.hp>0&&integer(state,1,100)<=38)target.statuses.poison=2;log(b,`${source.name} → ${target.name}：${amount} 点伤害${crit?'（暴击）':''}`,'hit');if(target.side==='hero')addStress(target,Math.max(0,integer(state,2,5)-Math.floor((target.stressResist||0)/5)));if(target.hp===0){log(b,`${target.name} 倒下了`,'hurt');compressRanks(b);}
 if(BOSS_TYPES.includes(target.type)&&target.hp>0){
  const nextPhase=target.hp<=target.maxHp*.3?3:target.hp<=target.maxHp*.65?2:1;
  while(b.bossPhase<nextPhase){b.bossPhase++;target.attack+=2;target.armor+=1;
   log(b,`${target.name} 进入第 ${b.bossPhase} 阶段！攻击 +2，护甲 +1`,'round');
   if(b.bossPhase===2){const reinforcements={crypt:'thrall',mire:'mireling',forge:'emberguard'};
    if(living(b.enemies).length<4){const e=createEnemy(state,reinforcements[b.region]||'thrall',4);e.rank=1+Math.max(...living(b.enemies).map(x=>x.rank));b.enemies.push(e);log(b,`援军出现：${e.name}`,'hurt');}
   }else{living(b.heroes).forEach(h=>addStress(h,6));log(b,'首领的绝望怒吼让全队承受 6 点压力','hurt');}
  }
 }
 return amount;}
export function selectEnemyTarget(state,actor,allies,ranged=false){
 if(!allies.length)return null;
 // Ranged specialists prioritize exposed healers; melee troops pressure the front row.
 if(ranged){const medics=allies.filter(h=>['medic','occult','penitent'].includes(h.classId));
  if(medics.length&&integer(state,1,100)<=65)return medics[integer(state,0,medics.length-1)];
  const weak=[...allies].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);if(weak[0].hp/weak[0].maxHp<.42)return weak[0];}
 const frontline=allies.slice(0,Math.min(2,allies.length));return frontline[integer(state,0,frontline.length-1)];
}
function enemyAct(state,actor){const b=state.battle;const allies=living(b.heroes);if(!allies.length)return;let target;
 if(BOSS_TYPES.includes(actor.type) && b.round%3===0){for(const h of allies){damage(state,actor,h,.64);addStress(h,8);}log(b,'噬誓者发出震耳欲聋的低语，所有英雄承受压力。','hurt');return;}
 if(actor.type==='cultist'||actor.type==='wraith'){target=selectEnemyTarget(state,actor,allies,true);addStress(target,integer(state,10,17));log(b,`${actor.name} 低吟不祥的祷文，${target.name} 压力上升`,'hurt');if(integer(state,1,100)<40)damage(state,actor,target,.5);return;}
 if(actor.type==='banshee'||actor.type==='herald'){target=selectEnemyTarget(state,actor,allies,true);addStress(target,integer(state,10,17));log(b,`${actor.name} 发出尖啸，${target.name} 陷入恐惧`,'hurt');if(actor.type==='herald'&&integer(state,1,100)<50)inflictStatus(state,target,'weak',100,2);return;}
 if(actor.type==='bonearcher'){target=selectEnemyTarget(state,actor,allies,true);damage(state,actor,target,1.1);return;}
 if(actor.type==='butcher'){target=selectEnemyTarget(state,actor,allies,false);damage(state,actor,target,1.12);if(target.hp>0)inflictStatus(state,target,'bleed',55,2);return;}
 if(['sporewitch','mirequeen'].includes(actor.type)){target=selectEnemyTarget(state,actor,allies,true);damage(state,actor,target,.7);if(target.hp>0)inflictStatus(state,target,'poison',100,2);return;}
 if(actor.type==='mireling'||actor.type==='leech'){target=selectEnemyTarget(state,actor,allies,true);damage(state,actor,target,.85);if(target.hp>0)inflictStatus(state,target,'poison',40,2);return;}
 if(['cinderseer','smelter','forgeheart'].includes(actor.type)){target=selectEnemyTarget(state,actor,allies,true);damage(state,actor,target,.9);addStress(target,4);return;}
 if(['bogcolossus','ironreaver','slagbeast'].includes(actor.type)){target=allies[0];damage(state,actor,target,1.3);return;}
 if(actor.type==='alchemist'){target=selectEnemyTarget(state,actor,allies,true);damage(state,actor,target,.7);inflictStatus(state,target,'poison',100,2);return;}
 target=selectEnemyTarget(state,actor,allies,false);damage(state,actor,target,actor.type==='guardian'?1.18:1);
}
export function performSkill(state,skillId,targetId){if(state.phase!=='battle')return {ok:false,error:'当前不在战斗中'};
 const b=state.battle, actor=currentActor(state);if(!actor||actor.side!=='hero')return {ok:false,error:'尚未轮到英雄行动'};
 const cls=CLASSES[actor.classId];if(!cls?.skills.includes(skillId))return {ok:false,error:'角色无法使用此技能'};
 const baseSkill=SKILLS[skillId],lv=skillLevel(actor,skillId),branch=skillBranch(actor,skillId),skill={...baseSkill,power:baseSkill.power+(baseSkill.type==='damage'?.12*lv:baseSkill.type==='heal'?4*lv:baseSkill.type==='relief'?6*lv:0)+(branch?.power||0),accuracy:Math.min(100,baseSkill.accuracy+2*lv)};if(!skill.caster.includes(actor.rank))return {ok:false,error:'当前位置无法使用此技能'};
 const targets=validTargets(b,actor,skill);const target=targets.find(t=>t.id===targetId);if(!target)return {ok:false,error:'目标不合法或已倒下'};
 if(integer(state,1,100)>clamp(skill.accuracy+(actor.accuracyBonus||0),1,100)){log(b,`${actor.name} 的 ${skill.name} 未命中`,'system');}
 else if(skill.type==='damage'){
  damage(state,actor,target,skill.power,{pierce:branch?.pierce||0,crit:branch?.crit||0});
  if(target.hp>0&&skill.status)inflictStatus(state,target,skill.status,(skill.chance||0)+(branch?.chance||0),(skill.status==='stun'?1:2)+(branch?.duration||0));
  if(target.hp>0&&branch?.mark)target.statuses.mark=Math.max(target.statuses.mark||0,branch.mark);
 }else if(skill.type==='heal'){
  const recovered=Math.min(target.maxHp-target.hp,Math.round(skill.power+(actor.level||1)*2+(actor.healBonus||0)+(branch?.heal||0)));target.hp+=recovered;
  if(branch?.cleanse){target.statuses.poison=0;target.statuses.bleed=0;}
  log(b,`${actor.name} 为 ${target.name} 恢复 ${recovered} 点生命${branch?.cleanse?'，并净化毒血':''}`,'heal');
 }else if(skill.type==='relief'){
  addStress(target,-skill.power-(branch?.relief||0));if(branch?.heal)target.hp=Math.min(target.maxHp,target.hp+branch.heal);log(b,`${actor.name} 安抚 ${target.name}，压力降低 ${skill.power+(branch?.relief||0)}`,'heal');
 }else if(skill.type==='guard'){
  actor.statuses.guard=2+lv+(branch?.duration||0);addStress(actor,-6-lv*2-(branch?.relief||0));log(b,`${actor.name} 进入守护姿态`,'heal');
 }else if(skill.type==='mark'){
  target.statuses.mark=3+lv+(branch?.duration||0);if(branch?.weak)inflictStatus(state,target,'weak',100,branch.weak);log(b,`${target.name} 被猎人标记`,'system');
 }
 if(skill.selfStress)addStress(actor,skill.selfStress);
 if(skill.selfDamage)actor.hp=Math.max(1,actor.hp-Math.max(0,skill.selfDamage-(branch?.selfDamageReduction||0)));
 if(branch?.weak&&skill.type==='damage'&&target.hp>0)inflictStatus(state,target,'weak',100,branch.weak);
 if(!endCheck(state))advanceTurn(state);
 return {ok:true};
}
export function useBandage(state,heroId){if(state.phase!=='map'||!state.expedition||state.expedition.bandages<=0)return false;
 const h=state.heroes.find(h=>h.id===heroId&&h.hp>0&&h.hp<h.maxHp);if(!h)return false;
 state.expedition.bandages--;h.hp=clamp(h.hp+14,0,h.maxHp);state.history.unshift(`${h.name} 使用绷带，恢复生命。`);return true;}
export function finishExpedition(state,reason){const ex=state.expedition;if(!ex)return;
 ensureProgression(state);const plan=EXPEDITION_PLANS[ex.plan]||EXPEDITION_PLANS.standard;
 const regionId=REGIONS[ex.region]?ex.region:'crypt',region=REGIONS[regionId];
 const threatLevel=regionThreatLevel(state,regionId);
 const rewards=reason==='defeat'?{gold:Math.floor(ex.lootGold*.35),shards:0,items:[]}:{gold:Math.floor(ex.lootGold*plan.goldMult*region.goldMult*(DIFFICULTIES[ex.difficulty]||DIFFICULTIES.pilgrim).gold*(1+.06*(threatLevel-1))),shards:Math.floor(ex.lootShards*plan.shardMult*region.shardMult*(DIFFICULTIES[ex.difficulty]||DIFFICULTIES.pilgrim).shards*(1+.06*(threatLevel-1))),items:ex.lootItems||[]};
 if(reason==='victory')state.regionVictories[regionId]=(state.regionVictories[regionId]||0)+1;
 state.gold+=rewards.gold;state.shards+=rewards.shards;state.items.push(...rewards.items);state.expeditions++;
 state.expeditionReports.unshift({day:state.day,region:regionId,difficulty:ex.difficulty||'pilgrim',reason,rooms:ex.roomsCleared,gold:rewards.gold,shards:rewards.shards});
 if(state.expeditionReports.length>20)state.expeditionReports.length=20;
 state.defeatStreak=reason==='defeat'?state.defeatStreak+1:0;
 if(state.defeatStreak>=2&&state.gold<35){state.gold+=40;state.supplies.torches=Math.max(3,state.supplies.torches);state.supplies.bandages=Math.max(1,state.supplies.bandages);state.defeatStreak=0;state.history.unshift('营地启动紧急救济：40 金币及基础补给。');}
 state.recruits=recruitOffers(state);state.day+=integer(state,2,4);
 const recovery=buildingLevel(state,'chapel')*6;
 for(const h of state.reserveHeroes){if(recovery)addStress(h,-recovery);const heal=buildingLevel(state,'infirmary')*3;if(heal)h.hp=clamp(h.hp+heal,1,h.maxHp);} 
 for(const h of state.heroes){if(h.hp<=0){h.hp=Math.max(1,Math.round(h.maxHp*.3));addStress(h,27);}else if(reason==='victory'){h.xp+=15;if(h.xp>=h.level*25){h.xp-=h.level*25;h.level++;h.talentPoints=(h.talentPoints||0)+1;h.maxHp=heroStats(h,state).maxHp;h.hp=Math.min(h.maxHp,h.hp+8);}}}
 for(const h of state.heroes)evolveTrait(state,h,reason);
 unlockAchievements(state);
 state.result={reason,rewards,rooms:ex.roomsCleared,day:state.day,region:regionId,difficulty:ex.difficulty||'pilgrim'};state.phase='result';state.event=null;state.battle=null;state.expedition=null;state.history.unshift(reason==='victory'?'噬誓者终于沉寂。远征告捷。':reason==='retreat'?'远征队撤离了深渊。':'远征队在黑暗中失散。');
}
export function retreat(state){if(state.phase!=='map')return false;finishExpedition(state,'retreat');return true;}
export function backToCamp(state){if(state.phase!=='result')return false;state.phase='camp';state.result=null;state.heroes.forEach(h=>{h.rank=state.heroes.indexOf(h)+1;});return true;}
export function healAtCamp(state,heroId){if(state.phase!=='camp')return false;ensureProgression(state);
 const cost=campHealCost(state),h=[...state.heroes,...state.reserveHeroes].find(h=>h.id===heroId);
 if(!h||state.gold<cost||(h.hp>=h.maxHp&&h.stress===0))return false;
 state.gold-=cost;const lv=buildingLevel(state,'infirmary');h.hp=clamp(h.hp+20+8*lv,0,h.maxHp);addStress(h,-(23+4*lv));return true;}
export function upgradeHero(state,heroId){if(state.phase!=='camp'||state.shards<5||state.gold<30)return false;const h=state.heroes.find(h=>h.id===heroId);if(!h||h.level>=5)return false;state.shards-=5;state.gold-=30;h.level++;h.talentPoints=(h.talentPoints||0)+1;h.maxHp=heroStats(h,state).maxHp;h.hp=clamp(h.hp+4,0,h.maxHp);return true;}
// Formation and workshop changes are camp-only; legacy V0.1 saves need no migration.
export function moveHero(state,id,direction){
 if(state.phase!=='camp'||![ -1,1 ].includes(direction))return false;
 const source=state.heroes.findIndex(h=>h.id===id),target=source+direction;
 if(source<0||target<0||target>=state.heroes.length)return false;
 [state.heroes[source],state.heroes[target]]=[state.heroes[target],state.heroes[source]];
 state.heroes.forEach((h,i)=>h.rank=i+1);return true;
}
export function forgeGear(state,id,kind){
 if(state.phase!=='camp'||!['weapon','armor'].includes(kind))return false;
 const h=state.heroes.find(h=>h.id===id);if(!h)return false;
 const level=h.gear?.[kind]||0;if(level>=3)return false;
 const gold=Math.max(10,25+level*20-buildingLevel(state,'workshop')*5),shards=2+level*2;
 if(state.gold<gold||state.shards<shards)return false;
 state.gold-=gold;state.shards-=shards;
 h.gear={...(h.gear||{}),[kind]:level+1};
 if(kind==='armor'){h.maxHp=heroStats(h,state).maxHp;h.hp=Math.min(h.maxHp,h.hp+3)}
 state.history.unshift(`${h.name} 强化了${kind==='weapon'?'武器':'护甲'}，达到 +${level+1}。`);
 return true;
}
export function buySupplies(state,type){if(state.phase!=='camp')return false;const c=type==='torches'?10:type==='bandages'?14:0;if(!c||state.gold<c)return false;state.gold-=c;state.supplies[type]++;return true;}
export function isValidSave(input){if(!input||typeof input!=='object'||input.schemaVersion!==VERSION||!['camp','map','battle','event','result'].includes(input.phase))return false;
 if(!Number.isInteger(input.gold)||input.gold<0||input.gold>1e9||!Number.isInteger(input.shards)||input.shards<0||input.shards>1e9||!Number.isInteger(input.day)||input.day<1||input.day>100000||!Number.isInteger(input.expeditions)||input.expeditions<0||input.expeditions>100000)return false;
 if(!input.supplies||!['torches','bandages'].every(k=>Number.isInteger(input.supplies[k])&&input.supplies[k]>=0&&input.supplies[k]<=100000))return false;
 if(!Array.isArray(input.history)||input.history.length>50000||input.history.some(x=>typeof x!=='string'||x.length>2000))return false;
 if(input.phase==='battle'&&!input.battle||input.phase==='map'&&!input.expedition||input.phase==='event'&&!input.event||input.phase==='result'&&!input.result)return false;
 if(!Array.isArray(input.heroes)||input.heroes.length!==4||!input.heroes.every(h=>h&&typeof h.id==='string'&&CLASSES[h.classId]&&Number.isFinite(h.hp)&&Number.isFinite(h.stress)&&Number.isFinite(h.maxHp)&&Number.isInteger(h.level)&&h.level>=1&&h.level<=5))return false;
 if(input.reserveHeroes!==undefined&&(!Array.isArray(input.reserveHeroes)||input.reserveHeroes.length>MAX_RESERVES||!input.reserveHeroes.every(h=>h&&CLASSES[h.classId]&&typeof h.id==='string'&&Number.isFinite(h.hp))))return false;
 if(input.items!==undefined&&(!Array.isArray(input.items)||input.items.length>300||!input.items.every(item=>item&&typeof item.id==='string'&&TRINKET_BASES[item.baseId]&&RARITY_NAMES[item.rarity]&&Array.isArray(item.affixes)&&item.affixes.every(id=>AFFIXES[id]))))return false;
 if(input.buildings!==undefined&&(!input.buildings||typeof input.buildings!=='object'||Object.entries(input.buildings).some(([id,lv])=>!BUILDINGS[id]||!Number.isInteger(lv)||lv<0||lv>MAX_BUILDING_LEVEL)))return false;
 if(input.expeditionPlan!==undefined&&!EXPEDITION_PLANS[input.expeditionPlan])return false;
 if(input.expedition?.plan!==undefined&&!EXPEDITION_PLANS[input.expedition.plan])return false;
 if(input.selectedRegion!==undefined&&!REGIONS[input.selectedRegion])return false;
 if(input.selectedDifficulty!==undefined&&!DIFFICULTIES[input.selectedDifficulty])return false;
 if(input.expedition?.difficulty!==undefined&&!DIFFICULTIES[input.expedition.difficulty])return false;
 if(input.expedition?.region!==undefined&&!REGIONS[input.expedition.region])return false;
 if(input.battle?.region!==undefined&&!REGIONS[input.battle.region])return false;
 if(input.regionVictories!==undefined&&(!input.regionVictories||typeof input.regionVictories!=='object'||Object.entries(input.regionVictories).some(([id,n])=>!REGIONS[id]||!Number.isInteger(n)||n<0||n>99999)))return false;
 if(input.defeatStreak!==undefined&&(!Number.isInteger(input.defeatStreak)||input.defeatStreak<0||input.defeatStreak>99999))return false;
 if(input.expeditionReports!==undefined&&(!Array.isArray(input.expeditionReports)||input.expeditionReports.length>20||!input.expeditionReports.every(r=>r&&REGIONS[r.region]&&DIFFICULTIES[r.difficulty]&&['victory','retreat','defeat'].includes(r.reason)&&Number.isInteger(r.day)&&r.day>0&&Number.isInteger(r.rooms)&&r.rooms>=0&&Number.isFinite(r.gold)&&r.gold>=0&&Number.isFinite(r.shards)&&r.shards>=0)))return false;
 for(const h of [...input.heroes,...(input.reserveHeroes||[])]){
  if(h.traits!==undefined&&(!Array.isArray(h.traits)||h.traits.length>4||!h.traits.every(t=>TRAITS[t])))return false;
  if(h.skillBranches!==undefined&&(!h.skillBranches||typeof h.skillBranches!=='object'||Object.entries(h.skillBranches).some(([id,choice])=>!CLASSES[h.classId].skills.includes(id)||!SKILL_BRANCHES[id]?.some(b=>b.id===choice)||(h.skillLevels?.[id]||0)<1)))return false;
  if(h.skillLevels!==undefined&&(!h.skillLevels||typeof h.skillLevels!=='object'||Object.entries(h.skillLevels).some(([id,lv])=>!CLASSES[h.classId].skills.includes(id)||!Number.isInteger(lv)||lv<0||lv>MAX_SKILL_LEVEL)))return false;
  if(h.crisis!==undefined&&h.crisis!==null&&!CRISES[h.crisis])return false;
  if(h.talentPoints!==undefined&&(!Number.isInteger(h.talentPoints)||h.talentPoints<0||h.talentPoints>10))return false;
  if(h.talents!==undefined&&(!h.talents||typeof h.talents!=='object'||Object.entries(h.talents).some(([id,lv])=>!TALENTS[id]||!Number.isInteger(lv)||lv<0||lv>TALENTS[id].max)))return false;
 }
 if(!Number.isFinite(input.gold)||input.gold<0||!Number.isFinite(input.shards)||input.shards<0||!Number.isInteger(input.rngState))return false;
 if(!input.supplies||!Number.isFinite(input.supplies.torches)||!Number.isFinite(input.supplies.bandages))return false;
 if(input.phase==='battle'&&(!input.battle||!Array.isArray(input.battle.heroes)||!Array.isArray(input.battle.enemies)||!Array.isArray(input.battle.order)||!input.expedition))return false;
 if((input.phase==='map'||input.phase==='event')&&(!input.expedition||!Array.isArray(input.expedition.nodes)))return false;
 if(input.achievements!==undefined&&(!input.achievements||typeof input.achievements!=='object'||Array.isArray(input.achievements)||Object.entries(input.achievements).some(([id,day])=>!ACHIEVEMENTS[id]||!Number.isInteger(day)||day<1||day>100000)))return false;
 if(input.tutorialSeen!==undefined&&typeof input.tutorialSeen!=='boolean')return false;
 return true;
}
export function skipTurn(state){if(state.phase!=='battle'||currentActor(state)?.side!=='hero')return false;
 const actor=currentActor(state);state.battle.logs.unshift({text:`${actor.name} 选择调整呼吸，跳过行动`,type:'system'});advanceTurn(state);return true;}
