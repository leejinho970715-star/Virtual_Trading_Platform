import{readFile}from'node:fs/promises';
import path from'node:path';
import{checkCredentials,makeSession,checkSession}from'../nova-server/auth.js';
import{stockData}from'../nova-server/stocks.js';
const base=path.join(process.cwd(),'.nova-private');
let configPromise;
const failures=new Map();
async function settings(){return configPromise??=Promise.all([readFile(path.join(base,'session.key'),'utf8'),readFile(path.join(base,'credentials.json'),'utf8')]).then(([key,json])=>({key,credentials:JSON.parse(json)}))}
function json(res,status,value){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value))}
async function body(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string')return JSON.parse(req.body);let text='';for await(const chunk of req){text+=chunk;if(text.length>4096)throw Error('too large')}return JSON.parse(text)}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin');res.setHeader('Vary','Cookie');
 try{
  const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
  if(pathname==='/nova'){res.statusCode=308;res.setHeader('Location','/nova/index.html');return res.end()}
  const resource=pathname.startsWith('/nova/')?pathname.slice(6):url.searchParams.get('resource')||'index.html';
  const route=resource||'index.html',{key,credentials}=await settings();
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('nova_session='))?.slice(13);
  const authenticated=checkSession(token,key),secure=process.env.VERCEL==='1'||req.headers['x-forwarded-proto']==='https';
  const cookie=value=>'nova_session='+value+'; HttpOnly; SameSite=Strict; Path=/nova/; '+(secure?'Secure; ':'');
  if(req.method==='POST'){
   const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host;
   if(!origin||new URL(origin).host!==host)return json(res,403,{error:'허용되지 않은 요청입니다.'});
   if(route==='auth/login'){
    const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0];
    const now=Date.now(),entry=failures.get(ip);
    if(entry&&entry.until>now&&entry.count>=8){res.setHeader('Retry-After','60');return json(res,429,{error:'잠시 후 다시 시도해 주세요.'})}
    const input=await body(req),valid=await checkCredentials(input.username,input.password,credentials);
    if(!valid){if(failures.size>5000)for(const[k,v]of failures)if(v.until<now)failures.delete(k);failures.set(ip,{count:entry?.until>now?entry.count+1:1,until:now+60000});return json(res,401,{error:'아이디 또는 비밀번호를 확인해 주세요.'})}
    failures.delete(ip);res.setHeader('Set-Cookie',cookie(makeSession(key))+'Max-Age=28800');return json(res,200,{ok:true});
   }
   if(route==='auth/logout'){res.setHeader('Set-Cookie',cookie('')+'Max-Age=0');return json(res,200,{ok:true})}
   return json(res,404,{error:'Not found'});
  }
  if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
  if(route==='auth/session')return json(res,authenticated?200:401,{authenticated});
  if(!authenticated){if(route!=='index.html'){return json(res,401,{error:'로그인이 필요합니다.'})}res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(req.method==='HEAD'?'':await readFile(path.join(base,'login.html')))}
  if(route==='stocks'){try{return json(res,200,await stockData(url.searchParams.get('symbol'),url.searchParams.get('period')||'months'))}catch{return json(res,502,{error:'국내 주식 시세를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.'})}}
  const files=new Set(['index.html','nova.css','nova.js','account.js','stocks.js',...['btc','eth','sol','xrp','doge','ada','link','avax'].map(x=>'assets/'+x+'.png')]);
  if(!files.has(route))return json(res,404,{error:'Not found'});
  const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',png:'image/png'};
  res.setHeader('Content-Type',types[route.split('.').pop()]);return res.end(req.method==='HEAD'?'':await readFile(path.join(base,'site',route)));
 }catch{return json(res,503,{error:'서비스를 준비 중입니다. 잠시 후 다시 시도해 주세요.'})}
}
