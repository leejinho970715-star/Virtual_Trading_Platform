const symbols=new Set(['005930','000660','005380','035420','373220','207940']);
const cache=new Map();
export async function stockData(symbol,period){
 if(!symbols.has(symbol)||!['day','months'].includes(period))throw Error('Invalid symbol');
 const key=symbol+period,old=cache.get(key);if(old&&Date.now()-old.at<30000)return old.data;
 const response=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.KS?interval=${period==='day'?'5m':'1d'}&range=${period==='day'?'5d':'3mo'}`,{signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Quote source unavailable');const value=(await response.json()).chart?.result?.[0];if(!value)throw Error('No data');
 const quote=value.indicators.quote[0],meta=value.meta;
 const bars=value.timestamp.map((time,i)=>({time,open:quote.open[i],high:quote.high[i],low:quote.low[i],close:quote.close[i],volume:quote.volume[i]})).filter(b=>[b.open,b.high,b.low,b.close].every(Number.isFinite));
 const data={symbol,currency:'KRW',price:meta.regularMarketPrice,time:meta.regularMarketTime,volume:meta.regularMarketVolume,high:meta.regularMarketDayHigh,low:meta.regularMarketDayLow,bars,source:'Yahoo Finance',delayMinutes:20};cache.set(key,{at:Date.now(),data});return data;
}
