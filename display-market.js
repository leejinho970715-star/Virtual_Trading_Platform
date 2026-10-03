// Decorative market quotes are independent of orders and scenario settlement.
export function createDisplayMarket(stocks,random=Math.random){
  return stocks.map(stock=>{
    const change=(random()-.5)*8;
    return {...stock,referencePrice:stock.price,change,price:stock.price*(1+change/100)};
  });
}
export function tickDisplayMarket(quotes,random=Math.random){
  return quotes.map(quote=>{
    const change=Math.max(-6,Math.min(6,quote.change*.55+(random()-.5)*6));
    return {...quote,change,price:quote.referencePrice*(1+change/100)};
  });
}
