export const INITIAL=[{ticker:'KMS001',name:'셀프컴퍼니',price:76400,change:1.84},{ticker:'HB002',name:'헬스바이옴',price:243500,change:-3.21},{ticker:'TA003',name:'트래블항공',price:211500,change:-.72},{ticker:'FH004',name:'패밀리홀딩스',price:211000,change:-.48},{ticker:'GE005',name:'관계엔터',price:56200,change:-1.16},{ticker:'SE006',name:'공부전자',price:342000,change:-1.07}];
export const MAX_POSITIONS=2;
export const positionCount=s=>Object.values(s.holdings).filter(h=>h.shares>0).length;
export const canBuy=(s,ticker)=>positionCount(s)<=MAX_POSITIONS&&(s.holdings[ticker]?.shares>0||positionCount(s)<MAX_POSITIONS);
export function fresh(){return {stocks:structuredClone(INITIAL),holdings:{},cash:1e8,nickname:'나',startingCoins:1000,appliedCoins:1000,day:0};}
export function metrics(s){const cost=s.stocks.reduce((v,x)=>v+(s.holdings[x.ticker]?.shares||0)*(s.holdings[x.ticker]?.avgPrice||0),0);const value=s.stocks.reduce((v,x)=>v+(s.holdings[x.ticker]?.shares||0)*x.price,0);const invested=Object.values(s.holdings).reduce((v,h)=>v+h.shares,0);return {cost,value,invested,available:Math.max(0,Math.floor(s.appliedCoins)-invested),returns:cost>0?(value-cost)/cost*100:0};}
export function order(s,ticker,side,amount){const qty=Math.floor(Number(amount));if(!Number.isFinite(qty)||qty<1)throw Error('투자 코인은 1 이상의 수량으로 입력해 주세요.');const stock=s.stocks.find(x=>x.ticker===ticker);if(!stock||!['buy','sell'].includes(side))throw Error('주문을 확인해 주세요.');const h=s.holdings[ticker]||{shares:0,avgPrice:0};const next=structuredClone(s);if(side==='buy'){if(!canBuy(s,ticker))throw Error('최대 2개 종목까지 투자할 수 있어요. 기존 종목을 모두 회수한 뒤 새 종목에 투자해 주세요.');if(qty>metrics(s).available)throw Error(`투자 가능한 코인은 ${metrics(s).available.toLocaleString('ko-KR')}개예요.`);next.holdings[ticker]={shares:h.shares+qty,avgPrice:(h.shares*h.avgPrice+qty*stock.price)/(h.shares+qty)};next.cash-=qty*stock.price;}else{if(qty>h.shares)throw Error(`회수 가능한 투자 코인은 ${h.shares.toLocaleString('ko-KR')}개예요.`);if(qty===h.shares)delete next.holdings[ticker];else next.holdings[ticker]={...h,shares:h.shares-qty};next.cash+=qty*stock.price;}return next;}
export function nextDay(s,random=Math.random){
  if(positionCount(s)>MAX_POSITIONS)throw Error('기존 투자 종목을 2개 이하로 줄인 뒤 다음 날로 이동해 주세요.');
  const next=structuredClone(s);
  const selfChange=50+50*random();
  // Scripted learning scenario: only self investment grows. Keep prices above zero.
  next.stocks=next.stocks.map(stock=>{
    const rate=stock.ticker==='KMS001'?selfChange:-(5+25*random());
    let price=stock.price*(1+rate/100);
    const holding=next.holdings[stock.ticker];
    if(holding?.shares>0&&stock.ticker!=='KMS001')price=Math.min(price,holding.avgPrice*.95);
    return {...stock,price,change:(price/stock.price-1)*100};
  });
  const self=next.stocks.find(stock=>stock.ticker==='KMS001');
  const holding=next.holdings.KMS001;
  if(holding?.shares>0){
    // Cover the companion's loss even with a 1:999 allocation or earlier losses.
    const before=metrics(s),after=metrics(next);
    const target=Math.max(before.cost,before.value)*1.01;
    self.price+=Math.max(0,target-after.value)/holding.shares;
    self.change=(self.price/s.stocks.find(stock=>stock.ticker==='KMS001').price-1)*100;
  }
  const result=metrics(next);
  const coins=next.startingCoins*(1+result.returns/100);
  next.appliedCoins=Math.max(0,result.returns>0?Math.ceil(coins):result.returns<0?Math.floor(coins):Math.round(coins));
  next.day++;
  return next;
}
