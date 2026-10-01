import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,metrics,order,nextDay} from './engine.js';
test('buy, weighted average, partial sell and full sell preserve original coin accounting',()=>{let s=fresh();s=order(s,'KMS001','buy',100);assert.equal(metrics(s).available,900);s.stocks[0].price=100000;s=order(s,'KMS001','buy',100);assert.equal(s.holdings.KMS001.avgPrice,88200);s=order(s,'KMS001','sell',50);assert.equal(s.holdings.KMS001.shares,150);assert.equal(metrics(s).available,850);s=order(s,'KMS001','sell',150);assert.equal(s.holdings.KMS001,undefined);assert.equal(metrics(s).available,1000);});
test('invalid and oversize trades do not mutate state',()=>{const s=fresh(),before=structuredClone(s);for(const n of [0,-1,NaN,Infinity,1001])assert.throws(()=>order(s,'KMS001','buy',n));assert.throws(()=>order(s,'KMS001','sell',1));assert.deepEqual(s,before);});
test('next-day ranges and applied coins match original simulation',()=>{let s=order(fresh(),'KMS001','buy',100);s=nextDay(s,()=>.5);assert.equal(s.stocks[0].change,75);assert.equal(s.stocks[1].change,-25);assert.equal(s.stocks[0].price,133700);assert.equal(s.appliedCoins,1750);assert.equal(metrics(s).available,1650);assert.equal(s.day,1);});
test('no positions keep starting coins and zero-price outcomes remain finite',()=>{let s=nextDay(fresh(),()=>0);assert.equal(s.appliedCoins,1000);assert.equal(s.stocks[1].price,0);s=order(s,'HB002','buy',1);assert.equal(metrics(s).returns,0);assert.ok(Number.isFinite(metrics(s).available));});
test('self company beats rounded maximum competitors even when stock order changes',()=>{
  const s=fresh();s.stocks.reverse();let calls=0;
  const result=nextDay(s,()=>calls++===0?0:.999999999);
  const self=result.stocks.find(x=>x.ticker==='KMS001');
  assert.equal(self.change,50);
  for(const stock of result.stocks.filter(x=>x.ticker!=='KMS001')){
    assert.equal(stock.change,49.99);
    assert.ok(stock.change<self.change);
  }
  assert.equal(s.day,0);
});
test('equal-entry investments keep self company highest across 30 adverse days',()=>{
  let state=fresh();for(const stock of state.stocks)state=order(state,stock.ticker,'buy',10);
  for(let day=0;day<30;day++){
    let calls=0;state=nextDay(state,()=>calls++===0?0:.999999999);
    const returns=state.stocks.map(stock=>({ticker:stock.ticker,value:stock.price/state.holdings[stock.ticker].avgPrice-1}));
    const self=returns.find(x=>x.ticker==='KMS001').value;
    assert.ok(returns.filter(x=>x.ticker!=='KMS001').every(x=>x.value<self));
  }
});
