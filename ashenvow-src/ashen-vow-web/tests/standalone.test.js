import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('standalone HTML embeds CSS, background art and game engine',()=>{
 const html=fs.readFileSync(path.join(root,'../ashen-vow-play-v1.0.html'),'utf8');
 assert.match(html,/data:image\/svg\+xml;base64,/);
 assert.match(html,/function battlePage\(/);
 assert.match(html,/function forgeGear\(/);assert.match(html,/function hireRecruit\(/);assert.match(html,/function trinketName\(/);
 assert.match(html,/combat-inspector/);
 assert.match(html,/chooseSkillBranch/);assert.match(html,/TRINKET_SETS/);assert.match(html,/V08_ROOMS/);assert.match(html,/enemy-intents/);assert.match(html,/journal-page/);assert.match(html,/battleTelemetry/);assert.match(html,/combat-action-report/);assert.match(html,/战斗表现节奏/);
 assert.doesNotMatch(html,/src="\.\/src\/ui\.js"/);
 assert.doesNotMatch(html,/url\('\.\/assets\//);
 const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 assert.doesNotThrow(()=>new vm.Script(script));
});
