# Pons Family with the Tapline TypeScript SDK

Use the Pons Family client to read the pons launchpad on Robinhood Chain: the launch board, token markets, charts, trades and holders, wallet positions, creator fees, and the memestock forum.

[Package guide](../../../README.md) · [Pons Family API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=ponsfamily_readme#/ponsfamily)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=ponsfamily_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=ponsfamily_readme).

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

Pons has two kinds of launch. Every `Launch` carries a `version`: read `v2` (curve) launches with the `getV2Market*` methods and `v1` tokens, such as PONS itself, with the `getMarket*` methods.

### Launches and protocol data

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `listLaunches` | `ListLaunchesParams`: optional `sort`, `age`, `version`, `page`, `page_size`, `include_graduated`, `graduated_page`, `graduated_page_size` | `ListLaunchesResponse`: the active board and a page of graduated launches |
| `searchLaunches` | `SearchLaunchesParams`: optional `q`, `sort`, `age`, `page` | `SearchLaunchesResponse`: launches matching a name, symbol, or address |
| `listGraduations` | no arguments | `Graduation[]`: every graduation with its block |
| `listGraduatedCatalog` | no arguments | `Launch[]`: graduated tokens as full launch records |
| `listLiveMarkets` | `ListLiveMarketsParams`: optional `markets` | `LiveMarket[]`: price and graduation progress for the launches currently trading |
| `getAnalytics` | no arguments | `GetAnalyticsResponse`: launch, volume, and revenue totals plus a daily series |
| `getEthPrice` | no arguments | `GetEthPriceResponse`: the ETH/USD rate pons prices launches with |
| `listCtoMigrations` | no arguments | `ListCtoMigrationsResponse`: community-takeover migrations and their schedules |

### v2 launch markets

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getV2MarketTrades` | `GetV2MarketTradesParams`: `token` | `GetV2MarketTradesResponse`: trades in the launch's quote asset |
| `getV2MarketChart` | `GetV2MarketChartParams`: `token`; optional `range` | `GetV2MarketChartResponse`: price and volume points with the quote asset's USD rate |
| `getV2MarketHolders` | `GetV2MarketHoldersParams`: `token` | `GetV2MarketHoldersResponse`: ranked holders and supply shares |
| `getV2CreatorFees` | `GetV2CreatorFeesParams`: `token` | `GetV2CreatorFeesResponse`: fee recipient, escrow, and fees earned so far |
| `getV2Distributor` | `GetV2DistributorParams`: `token` | `GetV2DistributorResponse`: holder fee-sharing state and the latest payout epoch |

### v1 token markets

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getMarket` | `GetMarketParams`: `token`; optional `include_holders` | `GetMarketResponse`: price, market cap, liquidity, recent trades, and price points |
| `getMarketTrades` | `GetMarketTradesParams`: `token` | `MarketTrade[]`: the latest buys and sells against the pool |
| `getMarketChart` | `GetMarketChartParams`: `token`; optional `range` | `GetMarketChartResponse`: bucketed price and volume points |
| `getMarketHolders` | `GetMarketHoldersParams`: `token` | `GetMarketHoldersResponse`: ranked holders with balance and PnL |
| `getMarketAth` | `GetMarketAthParams`: `token` | `GetMarketAthResponse`: all-time-high price and its block |
| `getMarketTip` | `GetMarketTipParams`: `token` | `GetMarketTipResponse`: the latest pool price |
| `getMarketBurned` | `GetMarketBurnedParams`: `token` | `GetMarketBurnedResponse`: supply burned, in wei |
| `getMarketOrderDepth` | `GetMarketOrderDepthParams`: `token` | `GetMarketOrderDepthResponse`: resting limit orders bucketed into price bands |
| `getDeveloperTrades` | `GetDeveloperTradesParams`: `token`, `deployer` | `GetDeveloperTradesResponse`: what the deployer bought, sold, moved, and burned |

### Tokens

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getToken` | `GetTokenParams`: `token` | `GetTokenResponse`: supply, socials, pool wiring, and deployer |
| `getTokenImages` | `GetTokenImagesParams`: `tokens` (up to 100) | `GetTokenImagesResponse`: logo URL keyed by lower-cased token address |
| `getFeeSharing` | `GetFeeSharingParams`: `tokens` (up to 100) | `GetFeeSharingResponse`: whether each token routes creator fees to holders |
| `getCreatorHoldings` | `CreatorHoldingsRequest` body: `pairs` of `token` and `deployer` (up to 100) | `GetCreatorHoldingsResponse`: the share of supply each deployer still holds |

### Wallets

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getWalletPositions` | `GetWalletPositionsParams`: `address` | `GetWalletPositionsResponse`: open and closed positions, trade activity, and PnL totals |
| `getPortfolioChart` | `GetPortfolioChartParams`: `address`; optional `range` | `GetPortfolioChartResponse`: portfolio value over time |
| `getProfile` | `GetProfileParams`: `address` | `GetProfileResponse`: launches the wallet deployed or earns fees from, with claimable fees |
| `getWalletIdentities` | `GetWalletIdentitiesParams`: `addresses` (up to 100) | `GetWalletIdentitiesResponse`: public pons usernames, avatars, and bios |

### Memestock forum

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `listForumPosts` | `ListForumPostsParams`: optional `sort`, `community` | `ListForumPostsResponse`: the forum feed |
| `getForumPost` | `GetForumPostParams`: `post_id` | `GetForumPostResponse`: one post with its votes and community |
| `getForumPostComments` | `GetForumPostCommentsParams`: `post_id`; optional `sort` | `GetForumPostCommentsResponse`: the comment thread, replies nested |
| `listForumCommunities` | `ListForumCommunitiesParams`: optional `rank`, `limit` | `ListForumCommunitiesResponse`: token communities ranked by market cap or burn |
| `getForumCommunity` | `GetForumCommunityParams`: `slug` | `GetForumCommunityResponse`: one community's supply, burn, and market cap |
| `getForumHolding` | `GetForumHoldingParams`: `token`, `wallet` | `GetForumHoldingResponse`: a wallet's balance and the posting tier it earns |
| `getForumMarket` | no arguments | `GetForumMarketResponse`: US market session, community ticker rows, and tracked equities |

## Browse the launch board

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const board = await tapline.ponsfamily.listLaunches({ sort: 'volume', page_size: 10 });
const found = await tapline.ponsfamily.searchLaunches({ q: 'pons' });

for (const launch of board.active?.items ?? []) {
  console.log(launch.symbol, launch.version, launch.token, launch.marketCapUsd);
}
console.log(found.total);
```

## Read a v2 launch's market

```ts
import { TaplineClient } from '@tapline/client';

const token = '0xD5f1afEA47b1A9eab414D2ee740cF1d6d039E725';
const tapline = new TaplineClient();

const chart = await tapline.ponsfamily.getV2MarketChart({ token, range: '1d' });
const trades = await tapline.ponsfamily.getV2MarketTrades({ token });
const holders = await tapline.ponsfamily.getV2MarketHolders({ token });

console.log(chart.quoteSymbol, chart.points?.length);
for (const trade of trades.trades?.slice(0, 5) ?? []) {
  console.log(trade.side, trade.account, trade.tokenAmount);
}
console.log(holders.holdersCount);
```

## Follow a wallet

```ts
import { TaplineClient } from '@tapline/client';

const wallet = '0x42e9c498135431a48796B5fFe2CBC3d7A1811927';
const tapline = new TaplineClient();

const positions = await tapline.ponsfamily.getWalletPositions({ address: wallet });
const chart = await tapline.ponsfamily.getPortfolioChart({ address: wallet, range: '7d' });

console.log(positions.totals?.portfolioValueUsd, positions.totals?.totalPnlUsd);
for (const position of positions.positions ?? []) {
  console.log(position.symbol, position.state, position.valueUsd);
}
console.log(chart.changePct);
```

## Read the memestock forum

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const feed = await tapline.ponsfamily.listForumPosts({ sort: 'top' });
const post = feed.posts?.[0];

if (post?.id) {
  const thread = await tapline.ponsfamily.getForumPostComments({ post_id: post.id });
  console.log(post.title, post.communitySymbol, thread.comments?.length);
}
```

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). The [Pons Family API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=ponsfamily_readme#/ponsfamily) lists the inputs, response fields, limits, and credit cost for each method.
