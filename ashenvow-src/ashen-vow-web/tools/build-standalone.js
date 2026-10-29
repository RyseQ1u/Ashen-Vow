// Inline all of the game's own assets into one downloadable offline HTML.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let css=read('style.css');
let modules=['src/data/tables.js','src/engine.js','src/storage.js','src/presentation.js','src/ui.js'].map(x=>read(x)).join('\n\n');
const mime={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
for(const asset of fs.readdirSync(path.join(root,'assets')).filter(x=>mime[path.extname(x).toLowerCase()])){
 const ext=path.extname(asset).toLowerCase();
 const data=fs.readFileSync(path.join(root,'assets',asset)).toString('base64');
 const uri=`data:${mime[ext]};base64,${data}`;
 css=css.replaceAll(`url('./assets/${asset}')`,`url('${uri}')`);
 modules=modules.replaceAll(`./assets/${asset}`,uri);
}
if(css.includes("url('./assets/"))throw Error('Unresolved standalone asset in CSS');
if(modules.includes('./assets/'))throw Error('Unresolved standalone asset in JS');
const strip=s=>s
 .replace(/^import [\s\S]*?from ['"][^'"]+['"];\s*$/gm,'')
 .replace(/^export \{[\s\S]*?\};\s*$/gm,'')
 .replace(/\bexport (?=(?:const|let|function|class|async))/g,'');
const script=strip(modules).replace(/<\/script/gi,'<\\/script');
const html=read('index.html').replace(/<link rel="stylesheet" href="\.\/style\.css"\s*\/>/,`<style>\n${css}\n</style>`).replace(/<script type="module" src="\.\/src\/ui\.js"><\/script>/,`<script>\n${script}\n</script>`);
if(!html.includes('function battlePage()')||html.includes('src="./src/ui.js"'))throw Error('Standalone generation failed');
const target=path.join(root,'../ashen-vow-play-v1.0.html');
fs.writeFileSync(target,html,'utf8');
console.log('Standalone built:',target,Buffer.byteLength(html),'bytes');
