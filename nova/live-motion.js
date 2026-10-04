const previous=new Map(),animations=new WeakMap();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

// Compare displayed values so polling an unchanged quote never triggers a flash.
export function flashChange(key,values,element){
 const before=previous.get(key);previous.set(key,values);
 if(!element||!before||reduced.matches||document.hidden)return;
 const changed=values.findIndex((value,i)=>Number.isFinite(value)&&Number.isFinite(before[i])&&value!==before[i]);
 if(changed<0)return;
 const color=values[changed]>before[changed]?'121,217,175':'241,126,135';
 animations.get(element)?.cancel();
 const animation=element.animate([
  {backgroundColor:`rgba(${color},0)`,boxShadow:`inset 0 0 0 1px rgba(${color},0)`},
  {backgroundColor:`rgba(${color},.15)`,boxShadow:`inset 0 0 0 1px rgba(${color},.42)`,offset:.16},
  {backgroundColor:`rgba(${color},0)`,boxShadow:`inset 0 0 0 1px rgba(${color},0)`}
 ],{duration:680,easing:'ease-out'});
 animations.set(element,animation);
 animation.onfinish=()=>{animation.cancel();if(animations.get(element)===animation)animations.delete(element)};
}
export function forgetFlash(key){previous.delete(key)}
