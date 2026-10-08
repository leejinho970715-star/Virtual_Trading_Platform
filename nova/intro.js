const reduced=matchMedia('(prefers-reduced-motion: reduce)'),container=document.querySelector('.coins');
if(!reduced.matches){for(let i=0;i<(innerWidth<600?12:22);i++){const coin=document.createElement('span');coin.className='coin';coin.textContent='N';coin.style.cssText=`left:${Math.random()*100}%;--size:${28+Math.random()*34}px;--duration:${2.8+Math.random()*2}s;--delay:${-Math.random()*4}s;--drift:${Math.random()*140-70}px`;container.append(coin)}}
let timer;function enter(){location.replace('app.html'+location.hash)}
function schedule(){clearTimeout(timer);if(document.hidden)return;timer=setTimeout(()=>{document.body.classList.add('leaving');timer=setTimeout(enter,reduced.matches?0:400)},4500)}
document.querySelector('.enter').addEventListener('click',()=>clearTimeout(timer));
document.addEventListener('visibilitychange',schedule);window.addEventListener('pagehide',()=>clearTimeout(timer));schedule();
