# Birdeye with the Tapline TypeScript SDK

Use the Birdeye client to read birdeye.so's token and wallet data: market overviews, security checks, trades, candles, pools, trending tokens and launchpad listings on Solana and seven EVM chains, plus trader leaderboards and wallet PnL.

[Package guide](../../../README.md) · [Birdeye API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=birdeye_readme#/birdeye)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=birdeye_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=birdeye_readme).

Install the package and save your key in `TAPLINE_API_KEY`:

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient({
  apiKey: process.env.TAPLINE_API_KEY,
});
```

If you omit `apiKey`, the client reads `TAPLINE_API_KEY` in Node.js. Keep the key on your server. Do not put it in browser code.

## What you can do

Token routes take `solana`, `ethereum`, `base`, `bsc`, `arbitrum`, `avalanche`, `optimism` or `polygon`. The PnL routes take `solana`, `ethereum`, `base` or `bsc`. Holders, first buyers, portfolio and net-worth history are Solana only.

| Method | Key inputs | Returns | Credits |
| --- | --- | --- | --- |
| `getTokenOverview` | `chain`, `address` | price, market cap, liquidity, supply, holders, socials, and buy, sell, volume and wallet counts per window | 1 |
| `getTokenSecurity` | `chain`, `address` | security checks grouped by severity, with birdeye and GoPlus results keyed by row `index` | 1 |
| `listTokenTrades` | `chain`, `address`, `side`, `limit` (up to 50), `cursor` | trade and liquidity events, newest first | 1 |
| `getTokenOhlcv` | `chain`, `address`, `interval` (`1s` to `1mo`), `count` (up to 1000), `to` | parallel `o`, `h`, `l`, `c`, `v`, `t` arrays | 1 |
| `listTokenMarkets` | `chain`, `address`, `sort_by`, `order` | up to 300 pools with venue, liquidity and 24h volume | 1 |
| `listTopTraders` | `chain` (PnL chains), `address`, `sort_by`, `order`, `limit`, `cursor` | wallets ranked by PnL on the token | 2 |
| `listTrendingTokens` | `chain` or `all` | birdeye's 20 trending tokens | 1 |
| `listNewListings` | `chain`, `stage` (`new`, `final_curve`, `migrated`) | up to 30 launchpad tokens | 1 |
| `listLeaderboard` | `chain` (PnL chains), `interval`, `sort_by`, `order`, `limit`, `cursor` | the trader leaderboard | 2 |
| `getWalletPnlSummary` | `chain` (PnL chains), `wallet`, `period` | realized, unrealized and total PnL, volumes, trade counts, return buckets | 2 |
| `listWalletTokens` | `chain` (PnL chains), `wallet`, `sort_by`, `order`, `limit`, `cursor` | per-token PnL for every token the wallet traded | 2 |
| `listWalletTransactions` | `chain` (PnL chains), `wallet`, `token`, `limit`, `cursor` | the wallet's swaps, newest first | 2 |
| `listTokenHolders` | `address` (Solana) | top 100 holders with net worth, SOL balance and funding source | 2 |
| `listFirstBuyers` | `address` (Solana) | the first buyers and what each did since | 2 |
| `listWalletPortfolio` | `wallet` (Solana), `limit`, `cursor` | current holdings by USD value and the wallet's total | 2 |
| `getNetWorthHistory` | `wallet` (Solana), `interval` (`1h`, `1d`), `count` (up to 90) | net worth points, newest first | 2 |

Paged methods cost their credits per page, not per item.

## Read a token's overview

```ts
const overview = await tapline.birdeye.getTokenOverview({
  chain: 'solana',
  address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
});
console.log(overview.symbol, overview.price, overview.liquidity, overview.holder);
```

## Page through trades

```ts
let cursor = '';
do {
  const page = await tapline.birdeye.listTokenTrades({
    chain: 'solana',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    side: 'buy',
    cursor,
  });
  for (const trade of page.items) console.log(trade.txHash, trade.volumeUSD);
  cursor = page.pagination.next_cursor ?? '';
} while (cursor);
```

## Read a wallet's PnL

```ts
const summary = await tapline.birdeye.getWalletPnlSummary({
  chain: 'base',
  wallet: '0x3304e22ddaa22bcdc5fca2269b418046ae7b566a',
  period: '7d',
});
console.log(summary.total_pnl, summary.realized_pnl, summary.tx_count);
```

## Read the response

- Paged methods return `items` and `pagination`. Pass `pagination.next_cursor` back as `cursor` until it is null. `pagination.completion` is `exhausted` at the end, or `depth_limit` where birdeye stops serving deeper pages (trades stop after offset 9,000).
- The trade tape moves while you page, so dedupe trades by `id`.
- EVM addresses may be sent in any case; the API checksums them for birdeye.
- birdeye leaves out fields that are zero, false or empty on the wallet and trader methods, so read them as optional.
- Counts and unix times on the wallet methods arrive as strings, as birdeye sends them. Parse them before you compare.
- An unknown token answers 404 on `getTokenOverview` and an empty list on the list methods. Both are charged.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors (a Solana address on an EVM chain, an unknown enum value, a cursor this API did not issue) are not charged. When birdeye has not computed a token's security checks yet, `getTokenSecurity` fails with status 503 and is not charged; retry in a minute.

The [Birdeye API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=birdeye_readme#/birdeye) lists the inputs, response fields, and credit cost for each method.
