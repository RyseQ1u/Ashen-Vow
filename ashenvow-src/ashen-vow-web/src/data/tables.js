// Static game data tables extracted from engine.js (Phase 0 refactor).
// No runtime logic — import-safe constants only.
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
  cleave:{name:'断誓斩',desc:'向敌方前排挥出沉重一击。',type:'damage',power:1.2,accuracy:92,caster:[1,2],targets:[1,2],side:'enemy',icon:'⚔',category:'damage'},
  bulwark:{name:'铁壁誓言',desc:'自身获得 2 回合护卫，并减轻压力。',type:'guard',power:0,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'self',icon:'⬡',category:'defense'},
  crush:{name:'碎骨冲击',desc:'对敌方前排造成伤害，有概率眩晕。',type:'damage',power:0.8,accuracy:88,caster:[1,2],targets:[1,2],side:'enemy',status:'stun',chance:35,icon:'✦',category:'finisher'},
  snipe:{name:'夜幕穿心',desc:'狙击中后排敌人，造成高额伤害。',type:'damage',power:1.4,accuracy:90,caster:[2,3,4],targets:[2,3,4],side:'enemy',icon:'➤',category:'finisher'},
  dagger:{name:'隐刃',desc:'突袭前排，造成快速伤害。',type:'damage',power:0.9,accuracy:97,caster:[1,2,3],targets:[1,2],side:'enemy',icon:'⌁',category:'damage'},
  mark:{name:'猎影标记',desc:'标记目标，使其承受更高伤害。',type:'mark',power:0,accuracy:100,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',icon:'◎',category:'buff'},
  mend:{name:'缝合祷言',desc:'治疗一名友军。',type:'heal',power:12,accuracy:100,caster:[2,3,4],targets:[1,2,3,4],side:'ally',icon:'✚',category:'buff'},
  scarlet:{name:'猩红药剂',desc:'投掷腐蚀药剂，施加中毒。',type:'damage',power:0.6,accuracy:93,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',status:'poison',chance:100,icon:'◈',category:'damage'},
  remedy:{name:'清醒剂',desc:'降低一名友军的压力。',type:'relief',power:22,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',icon:'❋',category:'finisher'},
  cinder:{name:'余烬飞弹',desc:'攻击任何敌方位置。',type:'damage',power:1.1,accuracy:93,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',icon:'✧',category:'damage'},
  hex:{name:'腐蚀咒印',desc:'伤害目标并附加虚弱。',type:'damage',power:0.65,accuracy:92,caster:[2,3,4],targets:[1,2,3,4],side:'enemy',status:'weak',chance:100,icon:'☽',category:'finisher'},
  solace:{name:'灰烬低语',desc:'抚慰一名友军，但术士承受少量压力。',type:'relief',power:28,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',selfStress:7,icon:'✺',category:'buff'},
  bloodlet:{name:'薄暮割裂',desc:'快速划伤目标，造成两回合流血。',type:'damage',power:.85,accuracy:96,caster:[1,2,3],targets:[1,2,3],side:'enemy',status:'bleed',chance:80,icon:'⌁',category:'damage'},
  puncture:{name:'破影突刺',desc:'精准穿刺任意位置的敌人。',type:'damage',power:1.25,accuracy:92,caster:[1,2,3,4],targets:[1,2,3,4],side:'enemy',icon:'➹',category:'finisher'},
  taunt:{name:'假面佯攻',desc:'标记敌人，为队友制造破绽。',type:'mark',power:0,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'enemy',icon:'◎',category:'defense'},
  scourge:{name:'痛苦鞭笞',desc:'重击前排目标并造成流血。',type:'damage',power:.95,accuracy:90,caster:[1,2],targets:[1,2],side:'enemy',status:'bleed',chance:70,icon:'⚔',category:'damage'},
  atonement:{name:'赎罪吟唱',desc:'大幅减轻队友压力，自己获得少量压力。',type:'relief',power:34,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',selfStress:9,icon:'✶',category:'finisher'},
  sacrifice:{name:'献血之誓',desc:'消耗自身 5 点生命治疗队友 19 点生命（无法使自己倒下）。',type:'heal',power:19,accuracy:100,caster:[1,2,3,4],targets:[1,2,3,4],side:'ally',selfDamage:5,icon:'✚',category:'buff'}
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
export const TRINKET_SETS={
 sentinel:{name:'守墓誓约',pieces:['iron','seal'],mods:{armor:2,hp:4},effect:'进入战斗获得 1 回合守护'},
 twilight:{name:'暮影之猎',pieces:['fang','thorn'],mods:{attack:2,crit:4},effect:'提高攻击和暴击'},
 sacred:{name:'灰烬祷仪',pieces:['relic','bell'],mods:{healBonus:4,stressResist:8},effect:'开战前压力 -5'},
 pilgrim:{name:'孤灯旅人',pieces:['torch','feather'],mods:{speed:2,hp:3},effect:'提高速度与生命'}
};
export const SKILL_CATEGORY_LABELS={damage:'伤害',defense:'防御',buff:'增益',finisher:'终结'};
export const STATUS_LABELS={poison:'中毒',bleed:'流血',stun:'眩晕',weak:'虚弱'};

export const MAX_SUPPLIES={torches:12,bandages:8,potions:6,sigils:4};
export const SUPPLY_META={
 torches:{name:'火把',icon:'♨',cost:10,desc:'照亮前路。火把耗尽后，每进入一间房间全队压力上升。'},
 bandages:{name:'绷带',icon:'✚',cost:14,desc:'地图上使用，恢复 14 点生命。'},
 potions:{name:'治疗药剂',icon:'⚗',cost:22,desc:'地图上使用，恢复 32 点生命。'},
 sigils:{name:'圣徽',icon:'✥',cost:26,desc:'地图上使用，单名英雄压力 −18。'}
};
export const NODE_NAME_POOL={
 battle:['断誓回廊','灰烬阶梯','亡骨集会所','无光甬道','碎剑大厅','回声长廊','葬火前厅'],
 elite:['守誓者刑场','黑铁审判席','噬骨祭台','余烬决斗场','无名殉道堂'],
 boss:['噬誓者王座','深渊之喉','灰烬王座','誓约终结处'],
 event:['低语碑林','迷雾岔路','遗忘祈祷室','血痕壁画廊','沉默守望处'],
 treasure:['陪葬宝库','锈蚀金库','殉誓者遗物室','秘藏侧室'],
 rest:['灰烬篝火','避风石室','旅人歇脚处','残破圣所'],
 supply:['废弃营帐','征用仓库','补给中转站','遗落辎重处'],
 shrine:['破晓祭坛','灰火神龛','净化圣堂','誓言残碑'],
 ambush:['伏击回廊','断后夹道','阴影门厅','坍塌甬道'],
 cache:['遗物秘库','封印密室','守誓者金库','机关藏宝间'],
 oracle:['占兆祭坛','盲眼圣所','命运圆厅','星火预言台'],
 caravan:['断桥商栈','流亡商队','废驿交易点','行商歇脚处']
};
export const V08_ROOMS={
 oracle:{title:'盲眼预言者',eyebrow:'特殊房间 · 命运占兆',desc:'白蜡封住了她的眼睛，但她依然知道每个人背负的名字。',choices:[
  {label:'交换一段痛苦记忆',hint:'全队压力 +6，获得遗物碎片 5–8',kind:'oracle-trade'},
  {label:'请求安抚与指引',hint:'支付 18 金币，全队压力 −15',kind:'oracle-calm'}]},
 caravan:{title:'断轮商队',eyebrow:'特殊房间 · 流亡旅商',desc:'满载着破损补给的车队停在断桥前，商人开出了危险却诱人的价码。',choices:[
  {label:'购买战地补给',hint:'支付 24 金币，获得火把 2、绷带 2',kind:'caravan-buy'},
  {label:'护送商队离开',hint:'小队承受少量压力，获得 20–34 金币',kind:'caravan-escort'}]}
};
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
export const BOSS_TYPES=['boss','mirequeen','forgeheart'];
export const REGION_EVENTS={
 crypt:{title:'亡者的铭碑',eyebrow:'墓窟异闻',desc:'碑文上记录着逝者的姓名。刻痕仍未干透，石缝里有隐约的祈祷。',choices:[{label:'解读禁忌铭文',hint:'获得遗物碎片，全队承受压力',kind:'shrine'},{label:'向亡者致意',hint:'全队减少压力',kind:'leave'}]},
 mire:{title:'会呼吸的孢子林',eyebrow:'沼泽异闻',desc:'泥水下发出均匀的呼吸，发光的孢子围住了一口古老药箱。',choices:[{label:'采集发光孢子',hint:'获得遗物，但队伍会受伤',kind:'spore'},{label:'点燃驱瘴火把',hint:'消耗 1 支火把，全队降低压力',kind:'purify'}]},
 forge:{title:'熄灭的誓约熔炉',eyebrow:'铸炉异闻',desc:'一座半熄的熔炉仍在呼唤献祭。炉内漂浮着冷却的稀有金属。',choices:[{label:'重启锻造机关',hint:'获得遗物碎片，全队失去少量生命',kind:'smelt'},{label:'搜集余温火种',hint:'补充火把和少量金币',kind:'embers'}]}
};
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
export const HERO_NAMES = ['伊莱恩','维尔','赛勒斯','莫拉'];

export const RECRUIT_NAMES=['莱希','乌诺','海泽尔','希恩','维克托','蕾娜','卡尔文','露西亚','艾斯塔','泰伦','米拉','诺拉','赛温','德林'];
export const MAX_RESERVES=6;
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
