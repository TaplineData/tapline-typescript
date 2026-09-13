# GeckoTerminal with the Tapline TypeScript SDK

Use the GeckoTerminal client to find pools, screen liquidity, read candlesticks and swaps, inspect traders, and follow market trends.

[Package guide](../../../README.md) · [GeckoTerminal API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=geckoterminal_readme#/geckoterminal)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=geckoterminal_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=geckoterminal_readme).

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

### Networks, search, and trends

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `dexes` | `DexesParams`: optional `network`, `page` | `DexesResponse`: indexed DEXes and activity metrics |
| `globalStats` | no arguments | `GlobalStatsResponse`: 24h volume, pool/network counts, fear-and-greed |
| `networks` | `NetworksParams`: optional `sort` | `NetworksResponse`: indexed chains and native currencies |
| `networkRankings` | `NetworkRankingsParams`: optional `page` | `NetworkRankingsResponse`: chain volume, transactions, and pool counts |
| `search` | `SearchParams`: `query` | `SearchResponse`: tokens, pools, pairs, categories, networks, and DEXes |
| `searchTrends` | no arguments | `SearchTrendsResponse`: current user search trends |
| `tags` | `TagsParams`: optional `page` | `TagsResponse`: token categories and leading tokens |
| `trendingLinks` | no arguments | `TrendingLinksResponse`: curated trending shortcuts |
| `trendingThemes` | `TrendingThemesParams`: optional `network`, `dex`, `more_themes` | `TrendingThemesResponse`: narratives and their driving pools |
| `trends` | `TrendsParams`: optional `network`, `dex` | `TrendsResponse`: top gainers, new pools, and hot pairs |

### Pool discovery

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `networkLatestPools` | `NetworkLatestPoolsParams`: `network`; optional `page`, `pool_creation_hours_ago_lte` | `NetworkLatestPoolsResponse`: newest pools on one chain |
| `networkPools` | `NetworkPoolsParams`, then `NetworkPoolScreenerRequest` body | `NetworkPoolsResponse`: screened pools on one chain or DEX |
| `latestPools` | `LatestPoolsParams`: optional `page`, `pool_creation_hours_ago_lte` | `LatestPoolsResponse`: newest pools across chains |
| `revivalRadarPools` | no arguments | `RevivalRadarPoolsResponse`: older pools with reaccelerating activity |
| `pools` | `PoolScreenerRequest` body | `PoolsResponse`: cross-chain pool screener |
| `tagNetworkPools` | `TagNetworkPoolsParams`: `tag`, `network`; optional `page` | `TagNetworkPoolsResponse`: category pools on one chain |
| `tagPools` | `TagPoolsParams`: `tag`; optional `page` | `TagPoolsResponse`: category pools across chains |

### Pool detail and activity

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `candlesticks` | `CandlesticksParams`: `pool_id`, `pair_id`, `from_timestamp`, `to_timestamp`; optional `resolution`, `currency`, `is_inverted` | `CandlesticksResponse`: OHLCV bars |
| `pool` | `PoolParams`: `network`, `address`; optional `base_token` | `PoolResponse`: price, reserves, GT score, security, tokens, DEX, developer |
| `poolRelatedPools` | `PoolRelatedPoolsParams`: `network`, `address` | `PoolRelatedPoolsResponse`: same-base-token pools and liquidity |
| `poolSenderSwaps` | `PoolSenderSwapsParams`: `network`, `address`, `from_timestamp`, `to_timestamp`; optional `pair_id`, `sender`, `include_developer`, `inverted` | `PoolSenderSwapsResponse`: swaps grouped by sender |
| `poolSwaps` | `PoolSwapsParams`: `network`, `address`, `pair_id`; `page_after` or `page_before`; optional `sender`, `inverted` | `PoolSwapsResponse`: individual swaps and cursors |
| `poolTokenInfoSnapshots` | `PoolTokenInfoSnapshotsParams`: `network`, `address` | `PoolTokenInfoSnapshotsResponse`: descriptions, socials, metadata for both tokens |

### Token, wallet, and developer data

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `tokenHistoricalHolders` | `TokenHistoricalHoldersParams`: `network`, `token_address`; optional `period` | `TokenHistoricalHoldersResponse`: holder-count time series |
| `tokenTopHolders` | `TokenTopHoldersParams`: `network`, `token_address` | `TokenTopHoldersResponse`: largest holders and supply shares |
| `tokenTopTraders` | `TokenTopTradersParams`: `token_id` | `TokenTopTradersResponse`: profitable wallets, P&L, buys, sells, balance |
| `walletToken` | `WalletTokenParams`: `token_id`, `wallet_address` | `WalletTokenResponse`: one wallet's token position and P&L |
| `tokenDeveloperPastTokens` | `TokenDeveloperPastTokensParams`: `developer_detail_id` | `TokenDeveloperPastTokensResponse`: other tokens from the developer |

## Find new pools

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const market = await tapline.geckoterminal.globalStats();
const networks = await tapline.geckoterminal.networkRankings({});
const newPools = await tapline.geckoterminal.networkLatestPools({ network: 'solana' });

console.log(market.data.attributes.pools_count);
console.log(networks.data.map((network) => network.attributes.name));
for (const pool of newPools.data.slice(0, 5)) {
  console.log(pool.attributes.address, pool.attributes.name);
}
```

## Get candlesticks and swaps

```ts
import { TaplineClient } from '@tapline/client';

const pool = 'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE';
const pairId = '1770231';
const now = Math.floor(Date.now() / 1000);
const tapline = new TaplineClient();

const candles = await tapline.geckoterminal.candlesticks({
  pool_id: '162714737',
  pair_id: pairId,
  from_timestamp: now - 86_400,
  to_timestamp: now,
  resolution: '15',
});
const swaps = await tapline.geckoterminal.poolSwaps({
  network: 'solana',
  address: pool,
  pair_id: pairId,
  page_after: String(now),
});

for (const bar of candles.data) {
  console.log(bar.dt, bar.o, bar.h, bar.l, bar.c, bar.v);
}
console.log(swaps.data.length);
```

Candlestick timestamps are Unix seconds. `poolSwaps` requires a cursor; start with the current Unix timestamp and continue with the response links.

## Inspect holders and traders

```ts
import { TaplineClient } from '@tapline/client';

const token = 'AfGdjAp9djSaqJxzYo3t6jy8tJA3o2aDPHoZ57Egpump';
const tapline = new TaplineClient();

const holders = await tapline.geckoterminal.tokenTopHolders({
  network: 'solana',
  token_address: token,
});
const traders = await tapline.geckoterminal.tokenTopTraders({ token_id: '124704000' });

console.log(holders.data.attributes.top_holders.length);
console.log(traders.data.length);
```

## Follow trends and developer history

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const trends = await tapline.geckoterminal.trends({ network: 'solana' });
const themes = await tapline.geckoterminal.trendingThemes({ network: 'solana' });
const history = await tapline.geckoterminal.tokenDeveloperPastTokens({
  developer_detail_id: '13236719',
});

console.log(trends.data.attributes.new_pools.length);
console.log(themes.data.length);
console.log(history.data.attributes.past_tokens_count);
```

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). The [GeckoTerminal API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=geckoterminal_readme#/geckoterminal) lists the inputs, response fields, limits, and credit cost for each method.
