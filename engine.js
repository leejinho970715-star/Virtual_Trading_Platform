export const INITIAL=[{ticker:'KMS001',name:'셀프컴퍼니',price:76400,change:1.84},{ticker:'HB002',name:'헬스바이옴',price:243500,change:3.21},{ticker:'TA003',name:'트래블항공',price:211500,change:-.72},{ticker:'FH004',name:'패밀리홀딩스',price:211000,change:.48},{ticker:'GE005',name:'관계엔터',price:56200,change:-1.16},{ticker:'SE006',name:'공부전자',price:342000,change:1.07}];
export function fresh(){return {stocks:structuredClone(INITIAL),holdings:{},cash:1e8,nickname:'나',startingCoins:1000,appliedCoins:1000,day:0};}
export function metrics(s){const cost=s.stocks.reduce((v,x)=>v+(s.holdings[x.ticker]?.shares||0)*(s.holdings[x.ticker]?.avgPrice||0),0);const value=s.stocks.reduce((v,x)=>v+(s.holdings[x.ticker]?.shares||0)*x.price,0);const invested=Object.values(s.holdings).reduce((v,h)=>v+h.shares,0);return {cost,value,invested,available:Math.max(0,Math.floor(s.appliedCoins)-invested),returns:cost>0?(value-cost)/cost*100:0};}
export function order(s,ticker,side,amount){const qty=Math.floor(Number(amount));if(!Number.isFinite(qty)||qty<1)throw Error('투자 코인은 1 이상의 수량으로 입력해 주세요.');const stock=s.stocks.find(x=>x.ticker===ticker);if(!stock||!['buy','sell'].includes(side))throw Error('주문을 확인해 주세요.');const h=s.holdings[ticker]||{shares:0,avgPrice:0};const next=structuredClone(s);if(side==='buy'){if(qty>metrics(s).available)throw Error(`투자 가능한 코인은 ${metrics(s).available.toLocaleString('ko-KR')}개예요.`);next.holdings[ticker]={shares:h.shares+qty,avgPrice:(h.shares*h.avgPrice+qty*stock.price)/(h.shares+qty)};next.cash-=qty*stock.price;}else{if(qty>h.shares)throw Error(`회수 가능한 투자 코인은 ${h.shares.toLocaleString('ko-KR')}개예요.`);if(qty===h.shares)delete next.holdings[ticker];else next.holdings[ticker]={...h,shares:h.shares-qty};next.cash+=qty*stock.price;}return next;}
export function nextDay(s,random=Math.random){
  const next=structuredClone(s);
  const selfChange=Number((50+50*random()).toFixed(2));
  // A deliberate simulation rule: self investment wins over any identical holding period.
  // Use the ticker rather than display order, and avoid ties caused by rounding.
  const competitorCap=Number((selfChange-.01).toFixed(2));
  next.stocks=next.stocks.map(stock=>{
    const change=stock.ticker==='KMS001'
      ?selfChange
      :Math.min(Number((-100+150*random()).toFixed(2)),competitorCap);
    return {...stock,change,price:Math.max(0,stock.price*(1+change/100))};
  });
  next.appliedCoins=Math.max(0,Math.round(next.startingCoins*(1+metrics(next).returns/100)));
  next.day++;
  return next;
}
