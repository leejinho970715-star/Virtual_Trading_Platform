import{readFile}from'node:fs/promises';
import path from'node:path';
import{stockData}from'../nova-server/stocks.js';
const base=path.join(process.cwd(),'.nova-private');
function json(res,status,value){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value))}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Vary','Cookie');
 try{
  const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
  if(pathname==='/nova'){res.statusCode=308;res.setHeader('Location','/nova/index.html');return res.end()}
  const resource=pathname.startsWith('/nova/')?pathname.slice(6):url.searchParams.get('resource')||'index.html';
  const route=resource||'index.html';
  if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
  if(route==='stocks'){try{return json(res,200,await stockData(url.searchParams.get('symbol'),url.searchParams.get('period')||'months'))}catch{return json(res,502,{error:'국내 주식 시세를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.'})}}
  const files=new Set(['index.html','app.html','intro.js','simulation.js','simulation-engine.js','nova.css','nova.js','account.js','stocks.js','live-motion.js',...['btc','eth','sol','xrp','doge','ada','link','avax'].map(x=>'assets/'+x+'.png')]);
  if(!files.has(route))return json(res,404,{error:'Not found'});
  const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',png:'image/png'};
  res.setHeader('Content-Type',types[route.split('.').pop()]);return res.end(req.method==='HEAD'?'':await readFile(path.join(base,'site',route==='index.html'?'intro.html':route==='app.html'?'index.html':route)));
 }catch{return json(res,503,{error:'서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요.'})}
}
