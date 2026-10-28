// Reproducible economic envelope audit, NOT proof of player-facing game balance.
import fs from 'node:fs';
import {freshGame,selectRegion,selectDifficulty,selectExpeditionPlan,beginExpedition,finishExpedition,backToCamp,REGIONS,DIFFICULTIES,EXPEDITION_PLANS,campHealCost,campPrayerCost,isValidSave} from '../src/engine.js';
const rows=[];
for(const region of Object.keys(REGIONS)){
 for(const difficulty of Object.keys(DIFFICULTIES)){
  for(const plan of Object.keys(EXPEDITION_PLANS)){
   const values=[];
   for(let seed=1;seed<=12;seed++){
    const state=freshGame(seed+1000);selectRegion(state,region);selectDifficulty(state,difficulty);selectExpeditionPlan(state,plan);
    beginExpedition(state);
    // Controlled reference haul: not a simulation of a human playing the entire dungeon.
    state.expedition.lootGold=100;state.expedition.lootShards=12;
    finishExpedition(state,'victory');
    if(!isValidSave(state))throw Error('Invalid economy fixture');
    values.push({gold:state.result.rewards.gold,shards:state.result.rewards.shards});
   }
   const avg=(key)=>Math.round(values.reduce((a,b)=>a+b[key],0)/values.length*100)/100;
   rows.push({region,difficulty,plan,gold:avg('gold'),shards:avg('shards')});
  }
 }
}
for(const region of Object.keys(REGIONS))for(const plan of Object.keys(EXPEDITION_PLANS)){
 const group=Object.keys(DIFFICULTIES).map(difficulty=>rows.find(x=>x.region===region&&x.plan===plan&&x.difficulty===difficulty));
 if(group.some((g,i)=>i&&g.gold<group[i-1].gold||g.shards<0))throw Error('Reward curve broken');
}
const health=freshGame(4321);
if(health.gold<0||health.shards<0||campHealCost(health)>health.gold||campPrayerCost(health)>health.gold)throw Error('Baseline camp economy broken');
const lines=['# V1.0 Economy Baseline Audit','',`抽样：${rows.length} 种「地区 × 难度 × 出征策略」组合，每组 12 个确定性种子。`,'','**方法约束：** 为比较收益倍率，强制每次远征固定带回基础 100 金币和 12 碎片、并假定胜利；并非模拟真实探索成功率、受伤成本或玩家最优策略，因此不能作为“游戏已完全平衡”的依据。','','| 地区 | 难度 | 策略 | 结算金币 | 结算碎片 |','|---|---|---|---:|---:|',...rows.map(x=>`| ${REGIONS[x.region].name} | ${DIFFICULTIES[x.difficulty].name} | ${EXPEDITION_PLANS[x.plan].name} | ${x.gold} | ${x.shards} |`),'','回归结论：在同一地区和策略下，高难度的金币收益倍率不低于低难度；所有结算保持非负。','',`新开局拥有 ${health.gold} 金币、${health.shards} 遗物碎片，基础治疗费用 ${campHealCost(health)} 金币、减压费用 ${campPrayerCost(health)} 金币。`,'','建议后续通过真实玩家测试量化：通关率、平均回合、损伤程度、破产比例、各职业出场率及不同饰品流派胜率。',''];
fs.writeFileSync(new URL('../BALANCE_REPORT_V10.md',import.meta.url),lines.join('\n'),'utf8');
console.log(`Audited ${rows.length} configurations x 12 seeds; base healing ${campHealCost(health)}, prayer ${campPrayerCost(health)}.`);
