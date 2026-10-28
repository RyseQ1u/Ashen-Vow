import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const strip=s=>s
 .replace(/^import [\s\S]*?from ['"][^'"]+['"];\s*$/gm,'')
 .replace(/^export \{[\s\S]*?\};\s*$/gm,'')
 .replace(/\bexport (?=(?:const|let|function|class|async))/g,'');
const tables=strip(fs.readFileSync(path.join(base,'src/data/tables.js'),'utf8'));
const engine=strip(fs.readFileSync(path.join(base,'src/engine.js'),'utf8'));
const storage=strip(fs.readFileSync(path.join(base,'src/storage.js'),'utf8'));
const presentation=strip(fs.readFileSync(path.join(base,'src/presentation.js'),'utf8'));
const ui=fs.readFileSync(path.join(base,'src/ui.js'),'utf8').replace(/^import .*?;\s*\n/gm,'');
test('UI templates render all primary game screens without throwing',async()=>{
 const root={innerHTML:'',addEventListener(){}};
 const generic={classList:{add(){},remove(){},toggle(){}},addEventListener(){},click(){},value:''};
 const document={getElementById:id=>id==='app'?root:generic,querySelector:()=>generic,documentElement:{}};
 const ctx=vm.createContext({console,document,window:{addEventListener(){},matchMedia(){return {matches:false}}},globalThis:null,localStorage:{getItem(){return null},setItem(){}},indexedDB:undefined,Date,Promise,Math,JSON,structuredClone,Blob,URL,setTimeout(){}});
 ctx.globalThis=ctx;
 vm.runInContext(`${tables}\n${engine}\n${storage}\n${presentation}\n${ui}`,ctx);
 await Promise.resolve();await new Promise(resolve=>setImmediate(resolve));
 assert.match(root.innerHTML,/开始新的誓约/);
 // Phase 4 main menu: four action cards, player profile, save card, unified logo
 assert.match(root.innerHTML,/landing-cards/);
 assert.match(root.innerHTML,/landing-profile/);
 assert.match(root.innerHTML,/夜烬旅者/);
 assert.match(root.innerHTML,/档案等级/);
 assert.match(root.innerHTML,/landing-save-card/);
 assert.match(root.innerHTML,/命运残页/);
 assert.match(root.innerHTML,/旅者指南/);
 assert.match(root.innerHTML,/WEB EDITION/);
 vm.runInContext('game=freshGame(111);view="game";render()',ctx);
 // Phase 2 camp overview: scene, buildings, team strip, depart CTA
 assert.match(root.innerHTML,/camp-overview/);
 assert.match(root.innerHTML,/camp-building/);
 assert.match(root.innerHTML,/camp-team-strip/);
 assert.match(root.innerHTML,/camp-depart/);
 assert.match(root.innerHTML,/camp-quick-actions/);
 vm.runInContext('campSection="heroes";campTab="team";render()',ctx);
 assert.match(root.innerHTML,/远征小队/);
 assert.match(root.innerHTML,/formation-controls/);
 assert.match(root.innerHTML,/锻造武器/);
 vm.runInContext('campTab="roster";render()',ctx);assert.match(root.innerHTML,/雇佣 · 65/);
 vm.runInContext('campTab="trinkets";render()',ctx);assert.match(root.innerHTML,/饰品仓库/);
 vm.runInContext('campSection="archive";campTab="town";render()',ctx);assert.match(root.innerHTML,/town-card/);assert.match(root.innerHTML,/战地医馆/);
 vm.runInContext('campSection="heroes";campTab="talents";render()',ctx);assert.match(root.innerHTML,/talent-card/);
 vm.runInContext('campTab="skills";render()',ctx);assert.match(root.innerHTML,/training-card/);assert.match(root.innerHTML,/技能训练/);
 vm.runInContext('campSection="archive";campTab="journal";render()',ctx);assert.match(root.innerHTML,/远征编年史/);
 vm.runInContext('campSection="heroes";campTab="team";render()',ctx);assert.match(root.innerHTML,/谨慎行军/);assert.match(root.innerHTML,/无光/);
 vm.runInContext('beginExpedition(game);render()',ctx);
 assert.match(root.innerHTML,/dungeon-map/);assert.match(root.innerHTML,/暮影墓窟/);
 // Phase 3 map UI: node intel panel, two-stage entry, team strip
 assert.match(root.innerHTML,/map-detail/);
 assert.match(root.innerHTML,/选择一个节点/);
 assert.match(root.innerHTML,/map-team-strip/);
 vm.runInContext('mapSelectedNode=reachableNodes(game)[0].id;render()',ctx);
 assert.match(root.innerHTML,/map-detail-name/);
 assert.match(root.innerHTML,/可能遭遇/);
 assert.match(root.innerHTML,/通关奖励/);
 assert.match(root.innerHTML,/风险评估/);
 assert.match(root.innerHTML,/risk-skulls/);
 assert.match(root.innerHTML,/enter-node/);
 vm.runInContext('enterNode(game,reachableNodes(game)[0].id);render()',ctx);
 assert.match(root.innerHTML,/combat-arena/);
 assert.match(root.innerHTML,/combat-inspector/);
 assert.match(root.innerHTML,/turn-strip/);
 assert.match(root.innerHTML,/unit-info-stats/);assert.match(root.innerHTML,/敌方行动预判/);
 assert.match(root.innerHTML,/initiative-portrait/);
 // Phase 1: force a hero turn to verify skill cards / basic attack / end turn
 vm.runInContext('if(game.battle){const h=game.battle.heroes.find(x=>x.hp>0);if(h)game.battle.activeId=h.id;}render()',ctx);
 assert.match(root.innerHTML,/skill-card/);
 assert.match(root.innerHTML,/skill-card-tag/);
 assert.match(root.innerHTML,/battle-hero-panel/);
 assert.match(root.innerHTML,/basic-attack/);
 assert.match(root.innerHTML,/end-turn/);
 // Phase 5: settings has ambient music toggle
 vm.runInContext('view="settings";render()',ctx);
 assert.match(root.innerHTML,/环境音乐/);
 assert.match(root.innerHTML,/setting-music/);
 vm.runInContext('view="saves";render()',ctx);
 assert.match(root.innerHTML,/空白存档/);
 vm.runInContext('view="settings";render()',ctx);
 assert.match(root.innerHTML,/界面音效/);assert.match(root.innerHTML,/大字体模式/);assert.match(root.innerHTML,/精简战斗日志/);
});
