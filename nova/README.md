# NOVA Exchange

Independent paper crypto exchange at `/nova/`. No connection to the parrot simulation or its predetermined outcomes.

- Coinbase public REST: 24-hour stats, ticker, level-2 book, trades, historical candles.
- Coinbase WebSocket: real ticker/heartbeat feeds. Selected order book and trades poll every 5 seconds; statistics refresh every minute. No invented prices on failure.
- Orders require a book received within 15 seconds. Simulated market executions use best bid/ask with 0.1% fees. Limit orders reserve funds/quantity and are evaluated while this page is connected. No liquidity/slippage/queue modeling.
- Initial virtual balance USD 100,000, local storage only, simulated funding, positions, pending cancellation, history, CSV export. Single-tab account use; no login; no real deposits, withdrawals, custody, derivatives, or server execution.
- Korean shares use Yahoo Finance KSE chart data through an allowlisted server endpoint; ~20-minute delayed data, refreshed every 30 seconds, with source timestamps. Viewing only; not included in crypto paper trading.
- Coin images: https://github.com/spothq/cryptocurrency-icons (CC0). BTC, ETH, SOL, XRP, DOGE, ADA, LINK, AVAX.
- Market list order reflects estimated Coinbase trading turnover, not global ranking or investment recommendations.

Sources: https://docs.cdp.coinbase.com/exchange/websocket-feed/channels and https://help.yahoo.com/kb/finance/article-exchanges-data-delays-sln2310.html

## Entry and simulation
`/nova/` shows the OG artwork with falling coins and automatically moves to `/nova/app.html` after 4.9 seconds. The enter link skips the intro. No credentials, session checks or login endpoints remain. Balances remain browser-local.

Crypto and Korea each offer an AI simulation menu. This label denotes a historical scenario tool, not an external LLM or trained prediction model. It resamples 5-day blocks of completed daily returns into 300 buy-and-hold paths over 5/20/60 days, with 25/50/100% exposure and 0.1% fees each way. It shows empirical percentiles and loss-path ratio, not calibrated forecast probabilities. Simulation does not alter paper-wallet holdings.
