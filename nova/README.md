# NOVA Exchange

Independent paper crypto exchange at `/nova/`. No connection to the parrot simulation or its predetermined outcomes.

- Coinbase public REST: 24-hour stats, ticker, level-2 book, trades, historical candles.
- Coinbase WebSocket: real ticker/heartbeat feeds. Selected order book and trades poll every 5 seconds; statistics refresh every minute. No invented prices on failure.
- Orders require a book received within 15 seconds. Simulated market executions use best bid/ask with 0.1% fees. Limit orders reserve funds/quantity and are evaluated while this page is connected. No liquidity/slippage/queue modeling.
- Initial virtual balance USD 100,000, local storage only, simulated funding, positions, pending cancellation, history, CSV export. Single-tab account use; server-gated shared login; no real deposits, withdrawals, custody, derivatives, or server execution.
- Korean shares use Yahoo Finance KSE chart data through an authenticated, allowlisted server endpoint; ~20-minute delayed data, refreshed every 30 seconds, with source timestamps. Viewing only; not included in crypto paper trading.
- Coin images: https://github.com/spothq/cryptocurrency-icons (CC0). BTC, ETH, SOL, XRP, DOGE, ADA, LINK, AVAX.
- Market list order reflects estimated Coinbase trading turnover, not global ranking or investment recommendations.

Sources: https://docs.cdp.coinbase.com/exchange/websocket-feed/channels and https://help.yahoo.com/kb/finance/article-exchanges-data-delays-sln2310.html

## Access
NOVA files are bundled privately with the Vercel function. Login uses a salted PBKDF2 password hash and an HttpOnly, SameSite=Strict, Secure cookie valid for 8 hours. Builds generate a private signing key; redeployment expires sessions. GitHub Pages redirects to the protected Vercel route. Instance-local login throttling is best-effort, not distributed rate limiting. Account balances remain browser-local; shared login is not multi-user account isolation.
