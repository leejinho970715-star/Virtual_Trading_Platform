import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,metrics,order,nextDay} from './engine.js';
test('buy, weighted average, partial sell and full sell preserve original coin accounting',()=>{let s=fresh();s=order(s,'KMS001','buy',100);assert.equal(metrics(s).available,900);s.stocks[0].price=100000;s=order(s,'KMS001','buy',100);assert.equal(s.holdings.KMS001.avgPrice,88200);s=order(s,'KMS001','sell',50);assert.equal(s.holdings.KMS001.shares,150);assert.equal(metrics(s).available,850);s=order(s,'KMS001','sell',150);assert.equal(s.holdings.KMS001,undefined);assert.equal(metrics(s).available,1000);});
test('invalid and oversize trades do not mutate state',()=>{const s=fresh(),before=structuredClone(s);for(const n of [0,-1,NaN,Infinity,1001])assert.throws(()=>order(s,'KMS001','buy',n));assert.throws(()=>order(s,'KMS001','sell',1));assert.deepEqual(s,before);});
test('self always rises and every other stock always falls at both random extremes',()=>{
 for(const random of [()=>0,()=>1]){let s=fresh();s.stocks.reverse();for(let day=0;day<30;day++){const before=s;s=nextDay(s,random);for(const stock of s.stocks){const old=before.stocks.find(x=>x.ticker===stock.ticker);assert.ok(stock.price>0);assert.ok(stock.ticker==='KMS001'?stock.price>old.price:stock.price<old.price);assert.ok(stock.ticker==='KMS001'?stock.change>0:stock.change<0)}assert.equal(s.appliedCoins,1000)}}
});
test('all permitted single and paired allocations produce the required result',()=>{
 for(let i=0;i<6;i++)for(let j=i;j<6;j++)for(const allocation of [1,500,999])for(const random of [()=>0,()=>1]){
  let s=fresh();s=order(s,s.stocks[i].ticker,'buy',i===j?1000:allocation);if(i!==j)s=order(s,s.stocks[j].ticker,'buy',1000-allocation);
  for(let day=0;day<8;day++){s=nextDay(s,random);const m=metrics(s);assert.ok(i===0?m.returns>=.99:m.returns<0);assert.ok(i===0?s.appliedCoins>1000:s.appliedCoins<1000);for(const stock of s.stocks){const h=s.holdings[stock.ticker];if(h)assert.ok(stock.ticker==='KMS001'?stock.price>h.avgPrice:stock.price<h.avgPrice)}}
 }
});
test('third company rejected while top-ups and replacing fully sold positions work',()=>{
 let s=order(fresh(),'KMS001','buy',10);s=order(s,'HB002','buy',10);const before=structuredClone(s);assert.throws(()=>order(s,'TA003','buy',1),/2개/);assert.deepEqual(s,before);s=order(s,'HB002','buy',5);s=order(s,'HB002','sell',14);assert.throws(()=>order(s,'TA003','buy',1),/2개/);s=order(s,'HB002','sell',1);s=order(s,'TA003','buy',1);assert.equal(s.holdings.TA003.shares,1);
});
test('adding self after losses restores positive total even with tiny allocation',()=>{
 let s=order(fresh(),'HB002','buy',999);s=nextDay(s,()=>1);s=order(s,'HB002','sell',300);s=order(s,'KMS001','buy',1);s=nextDay(s,()=>0);assert.ok(metrics(s).returns>=.99);s=order(s,'KMS001','sell',1);s=nextDay(s,()=>0);assert.ok(metrics(s).returns<0);
});
test('legacy gains are corrected and over-limit portfolios require recovery',()=>{
 let s=order(fresh(),'HB002','buy',10);s.stocks[1].price*=3;s=nextDay(s,()=>0);assert.ok(metrics(s).returns<0);
 s.holdings.TA003={shares:1,avgPrice:211500};s.holdings.FH004={shares:1,avgPrice:211000};assert.throws(()=>nextDay(s),/2개/);assert.throws(()=>order(s,'HB002','buy',1),/2개/);s=order(s,'FH004','sell',1);assert.doesNotThrow(()=>nextDay(s));
});
import {createDisplayMarket,tickDisplayMarket} from './display-market.js';
test('every decorative quote can cross zero without changing account settlement',()=>{
 const account=order(fresh(),'HB002','buy',10),before=structuredClone(account);
 let quotes=createDisplayMarket(account.stocks,()=>0);
 assert.ok(quotes.every(q=>q.change<0));
 for(let i=0;i<5;i++)quotes=tickDisplayMarket(quotes,()=>1);
 assert.ok(quotes.every(q=>q.change>0));
 for(let i=0;i<5;i++)quotes=tickDisplayMarket(quotes,()=>0);
 assert.ok(quotes.every(q=>q.change<0&&q.price>0));
 assert.deepEqual(account,before);
 assert.ok(metrics(nextDay(account,()=>1)).returns<0);
});
