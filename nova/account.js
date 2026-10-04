export const FEE=.001;
export function freshAccount(){return{version:1,cash:100000,deposited:100000,withdrawn:0,positions:{},pending:[],history:[],funding:[]}}
export function availableCash(a){return Math.max(0,a.cash-a.pending.filter(o=>o.side==='buy').reduce((n,o)=>n+o.qty*o.limit*(1+FEE),0))}
export function availableQty(a,id){return Math.max(0,(a.positions[id]?.qty||0)-a.pending.filter(o=>o.side==='sell'&&o.id===id).reduce((n,o)=>n+o.qty,0))}
export function validateAccount(a){return a?.version===1&&Number.isFinite(a.cash)&&a.cash>=0&&Number.isFinite(a.deposited)&&Number.isFinite(a.withdrawn)&&a.positions&&Object.values(a.positions).every(p=>Number.isFinite(p.qty)&&p.qty>=0&&Number.isFinite(p.cost)&&p.cost>=0)&&['pending','history','funding'].every(k=>Array.isArray(a[k]))&&a.history.every(o=>/^[A-Z]+-USD$/.test(o.id)&&['체결','취소'].includes(o.status)&&Number.isFinite(o.qty)&&Number.isFinite(o.price)&&Number.isFinite(o.fee))&&a.pending.every(o=>/^[a-f0-9-]+$/.test(o.key)&&typeof o.id==='string'&&['buy','sell'].includes(o.side)&&Number.isFinite(o.qty)&&o.qty>0&&Number.isFinite(o.limit)&&o.limit>0)}
function fill(a,order,price){const {id,side,qty}=order,notional=price*qty,fee=notional*FEE,p=a.positions[id]||{qty:0,cost:0};if(side==='buy'){if(notional+fee>a.cash+1e-8)throw Error('가상 잔액이 부족합니다.');a.cash=Math.max(0,a.cash-notional-fee);a.positions[id]={qty:p.qty+qty,cost:p.cost+notional+fee}}else{if(qty>p.qty+1e-10)throw Error('보유 수량이 부족합니다.');const remaining=Math.max(0,p.qty-qty);a.cash+=notional-fee;if(remaining<1e-10)delete a.positions[id];else a.positions[id]={qty:remaining,cost:p.cost*remaining/p.qty}}a.history.unshift({...order,price,fee,status:'체결',time:new Date().toISOString()});a.history=a.history.slice(0,500)}
export function placeOrder(account,{id,side,qty,type,limit},quote,now=Date.now()){
 if(!['buy','sell'].includes(side)||!['market','limit'].includes(type)||typeof id!=='string'||!Number.isFinite(qty)||qty<=0)throw Error('주문 수량을 확인해 주세요.');
 if(!quote||!Number.isFinite(quote.bid)||!Number.isFinite(quote.ask)||quote.bid<=0||quote.ask<quote.bid||now-quote.at>15000||quote.at>now+1000)throw Error('최신 호가를 기다려 주세요. 연결이 끊기거나 오래된 시세로는 주문할 수 없습니다.');
 if(type==='limit'&&(!Number.isFinite(limit)||limit<=0))throw Error('지정 가격을 확인해 주세요.');
 const price=type==='limit'?limit:side==='buy'?quote.ask:quote.bid;
 if(!Number.isFinite(price*qty)||price*qty<1)throw Error('최소 주문 금액은 $1입니다.');
 if(side==='buy'&&price*qty*(1+FEE)>availableCash(account)+1e-8)throw Error('수수료를 포함한 주문 가능 금액이 부족합니다.');
 if(side==='sell'&&qty>availableQty(account,id)+1e-10)throw Error('주문 가능한 보유 수량이 부족합니다.');
 const a=structuredClone(account),o={key:crypto.randomUUID(),id,side,qty,type,limit:type==='limit'?limit:null,time:new Date(now).toISOString()};
 if(type==='market'||side==='buy'&&quote.ask<=limit||side==='sell'&&quote.bid>=limit)fill(a,o,side==='buy'?quote.ask:quote.bid);else a.pending.push(o);
 return a;
}
export function settlePending(account,id,quote,now=Date.now()){
 if(!quote||now-quote.at>15000||quote.at>now+1000||!(quote.bid>0)||!(quote.ask>=quote.bid))return account;
 const matches=account.pending.filter(o=>o.id===id&&(o.side==='buy'?quote.ask<=o.limit:quote.bid>=o.limit));if(!matches.length)return account;
 const a=structuredClone(account);for(const o of matches){a.pending=a.pending.filter(p=>p.key!==o.key);fill(a,o,o.side==='buy'?quote.ask:quote.bid)}return a;
}
export function cancelOrder(account,key){const a=structuredClone(account),o=a.pending.find(o=>o.key===key);if(!o)return a;a.pending=a.pending.filter(o=>o.key!==key);a.history.unshift({...o,price:o.limit,fee:0,status:'취소',time:new Date().toISOString()});return a}

