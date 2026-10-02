import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','style.css','app.js','engine.js'])await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
await cp('terminal','dist/terminal',{recursive:true});
if(process.env.VERCEL==='1'){
  const html=await readFile('dist/index.html','utf8');
  await writeFile('dist/index.html',html.replaceAll('https://leejinho970715-star.github.io/Virtual_Trading_Platform/','https://virtual-trading-platform-rho.vercel.app/'));
}
console.log('Static site ready in dist');
