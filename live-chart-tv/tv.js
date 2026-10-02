// Preserve the entire TV composition on small screens, without scrollbars.
function fitTV(){
  const width=Math.max(1100,window.innerWidth);
  const height=Math.max(640,window.innerHeight);
  const scale=Math.min(window.innerWidth/width,window.innerHeight/height);
  const board=document.querySelector('.layout');
  board.style.setProperty('--tv-width',width+'px');
  board.style.setProperty('--tv-height',height+'px');
  board.style.setProperty('--tv-scale',scale);
}
fitTV();
window.addEventListener('resize',fitTV);
