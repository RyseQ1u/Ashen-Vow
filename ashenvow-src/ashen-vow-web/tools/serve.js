// Offline development server without third-party packages.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT)||5173;
http.createServer(async(req,res)=>{
 try{
  const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const target=path.resolve(base,'.'+(route==='/'?'/index.html':route));
  if(target!==base&&!target.startsWith(base+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const content=await fs.readFile(target);
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(content);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>{console.log(`灰烬誓约 Web 游戏已启动: http://127.0.0.1:${port}`);});
