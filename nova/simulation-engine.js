export function simulate({closes,capital,days,exposure=1,runs=300,random=Math.random}){
 if(!Array.isArray(closes)||closes.length<21||closes.some(n=>!Number.isFinite(n)||n<=0))throw Error('최소 21개의 유효한 과거 종가가 필요합니다.');
 if(!Number.isFinite(capital)||capital<=0||capital>1e12||!Number.isInteger(days)||days<1||days>60||![.25,.5,1].includes(exposure)||!Number.isInteger(runs)||runs<10||runs>1000)throw Error('투자금과 기간을 확인해 주세요.');
 const returns=closes.slice(1).map((n,i)=>n/closes[i]-1),paths=[];
 for(let run=0;run<runs;run++){let invested=capital*exposure/1.001;const cash=capital*(1-exposure),path=[capital];let index=0;
  for(let day=1;day<=days;day++){if((day-1)%5===0)index=Math.min(returns.length-1,Math.floor(random()*returns.length));invested*=1+returns[index%returns.length];index++;path.push(cash+invested*.999)}paths.push(path);
 }
 const quantile=(a,q)=>{const sorted=[...a].sort((a,b)=>a-b),i=(sorted.length-1)*q;return sorted[Math.floor(i)]+(sorted[Math.ceil(i)]-sorted[Math.floor(i)])*(i%1)};
 const bands=Array.from({length:days+1},(_,i)=>{const values=paths.map(p=>p[i]);return{low:quantile(values,.1),median:quantile(values,.5),high:quantile(values,.9)}}),final=paths.map(p=>p.at(-1));
 return{bands,paths:paths.slice(0,12),lossRatio:final.filter(n=>n<capital).length/runs,runs,capital,days,exposure,samples:returns.length};
}
