import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import novaHandler from './api/nova.js';
const root = process.cwd();
const publicFiles = new Set(['index.html', 'style.css', 'app.js', 'engine.js', 'terminal/index.html', 'terminal/terminal.css', 'terminal/terminal.js', 'terminal/market.js']);
const mime = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', png: 'image/png', jpg: 'image/jpeg', woff2: 'font/woff2' };
publicFiles.add('display-market.js');
for (const file of ['index.html', 'tv.css', 'tv.js']) publicFiles.add('live-chart-tv/' + file);
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if(url.pathname==='/nova'||url.pathname.startsWith('/nova/')||url.pathname==='/api/nova')return await novaHandler(req,res);
    if(['/nova-brand/og.jpg','/nova-brand/favicon.svg'].includes(url.pathname)){
      res.writeHead(200,{'Content-Type':url.pathname.endsWith('.svg')?'image/svg+xml':'image/jpeg'});
      return res.end(await readFile(path.join(root,url.pathname.slice(1))));
    }
    const file = url.pathname === '/' ? 'index.html' : url.pathname === '/terminal/' ? 'terminal/index.html' : url.pathname === '/live-chart-tv/' ? 'live-chart-tv/index.html' : url.pathname === '/nova/' ? 'nova/index.html' : decodeURIComponent(url.pathname).slice(1);
    const isAsset = /^assets\/(?:fonts\/)?[a-zA-Z0-9_-]+\.(?:png|jpg|woff2)$/.test(file);
    if (!publicFiles.has(file) && !isAsset) { res.writeHead(404); return res.end('Not found'); }
    const data = await readFile(path.join(root, file));
    res.writeHead(200, { 'Content-Type': mime[file.split('.').pop()], 'Cache-Control': 'no-store' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Exchange running at http://localhost:' + (process.env.PORT || 4173)));
