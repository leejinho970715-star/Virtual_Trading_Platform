import {mkdir,copyFile,cp,readFile,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','engine.js','outcome-effects.js','display-market.js'])await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
await cp('terminal','dist/terminal',{recursive:true});
await cp('live-chart-tv','dist/live-chart-tv',{recursive:true});
// Bundle NOVA pages with the route handler for consistent entry navigation.
const novaStatic=path.resolve('dist/nova');
if(path.dirname(novaStatic)!==path.resolve('dist'))throw Error('Invalid NOVA output path');
await rm(novaStatic,{recursive:true,force:true});
const bundle=path.resolve('.nova-private');
if(path.dirname(bundle)!==process.cwd())throw Error('Invalid bundle path');
await rm(bundle,{recursive:true,force:true});
await mkdir(bundle,{recursive:true});
await cp('nova','.nova-private/site',{recursive:true});
await mkdir('dist/nova-brand',{recursive:true});
for(const file of ['og.jpg','favicon.svg'])await copyFile('nova-brand/'+file,'dist/nova-brand/'+file);
if(process.env.VERCEL!=='1'){
 await mkdir('dist/nova',{recursive:true});
 await writeFile('dist/nova/index.html','<!doctype html><html lang="ko"><meta charset="utf-8"><title>NOVA Exchange</title><meta http-equiv="refresh" content="0;url=https://virtual-trading-platform-rho.vercel.app/nova/"><a href="https://virtual-trading-platform-rho.vercel.app/nova/">NOVA Exchange로 이동</a></html>');
}
if(process.env.VERCEL==='1'){
  const html=await readFile('dist/index.html','utf8');
  await writeFile('dist/index.html',html.replaceAll('https://leejinho970715-star.github.io/Virtual_Trading_Platform/','https://virtual-trading-platform-rho.vercel.app/'));
}
console.log('Static site ready in dist');
