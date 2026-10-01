import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const file=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1);if(!['index.html','style.css','app.js','engine.js','assets/parrot-coin.png','assets/parrot-yellow.png','assets/parrot-red.png','assets/glass-market.png','assets/glass-portfolio.png'].includes(file)){res.writeHead(404);return res.end('Not found');}const data=await readFile(path.join(root,file));res.writeHead(200,{'Content-Type':({'html':'text/html; charset=utf-8','css':'text/css; charset=utf-8','js':'text/javascript; charset=utf-8','png':'image/png'})[file.split('.').pop()],'Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(500);res.end('Server error');}}).listen(4173,'127.0.0.1',()=>console.log('Exchange running at http://localhost:4173'));

