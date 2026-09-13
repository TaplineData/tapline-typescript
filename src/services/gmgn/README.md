# GMGN with the Tapline TypeScript SDK

Use the GMGN client to find tokens, check security and market data, inspect holders and traders, and analyze wallets.

[Package guide](../../../README.md) · [GMGN API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=gmgn_readme#/gmgn)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=gmgn_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=gmgn_readme).

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

### Discovery and rankings

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `gasPriceList` | no arguments | `GetGasPriceListResponse`: chain gas, priority/MEV tips, confirmation estimates, native USD prices |
| `hotSearches` | `TrendingTokensRequest` body: `requests` | `GetHotSearchesResponse`: search-volume token rankings |
| `liveTwitchKol` | no arguments | `GetLiveTwitchKolResponse`: live known-influencer Twitch channels by chain |
| `majorCoinPrices` | `SymbolListRequest` body: `symbols` | `GetMajorCoinPricesResponse`: spot price per requested symbol |
| `trendingTokens` | `TrendingTokensRequest` body: chain, interval, filters, launchpads, limit | `GetTrendingTokensResponse`: one leaderboard bucket per request |
| `activityRankInfo` | `ActivityRankInfoParams`: `chain` | `GetActivityRankInfoResponse`: trading-competition window and leaderboard |
| `bluechipRank` | `BluechipRankParams`: `chain`; optional `interval`, `limit`, `filters` | `GetBluechipRankResponse`: tokens ranked by blue-chip-holder share |
| `dexTradesPolling` | `DexTradesPollingParams`: `chain`; optional `window` | `GetDexTradesPollingResponse`: DEX, launchpad, and protocol activity totals |
| `launchpadTaxPolicy` | `LaunchpadTaxPolicyParams`: `chain` | `GetLaunchpadTaxPolicyResponse`: launchpad tax and trading-limit rules |
| `newPairs` | `NewPairsParams`: `chain`; optional `interval`, `limit`, `order_by`, `filters`, `launchpad_platforms` | `GetNewPairsResponse`: new pairs with liquidity and launchpad data |
| `search` | `SearchParams`: `chain`, `q` | `SearchTokensResponse`: matching tokens and wallets |
| `similarCoinExtremes` | `SimilarCoinExtremesParams`: `chain`, `symbol`, `name`, `token_address` | `GetSimilarCoinExtremesResponse`: earliest and highest-market-cap lookalikes |
| `similarCoins` | `SimilarCoinsParams`: `chain`, `symbol`, `name`, `token_address`; optional `order_by` | `GetSimilarCoinsResponse`: related names and symbols |
| `swapRankings` | `SwapRankingsParams`: `chain`; optional `timeframe`, `platforms` | `GetSwapRankingsResponse`: tokens ranked by non-wash swap activity |
| `tokenSignals` | `TokenSignalsParams`, then `TokenSignalsRequest` body | `GetTokenSignalsResponse`: tokens firing configured surge signals |
| `topCallers` | `TopCallersParams`: `chain`; optional `window` | `GetTopCallersResponse`: wallets ranked by public-call returns |
| `walletRankings` | `WalletRankingsParams`: `chain`; optional `period`, `order_by` | `GetWalletRankingsResponse`: smart-money leaderboard and daily profit history |

### Batch token profiles and prices

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `multiTokenFullInfo` | `MultiTokenFullInfoParams`, then `AddressListRequest` body | `GetMultiTokenFullInfoResponse`: pool, security, creator, rug, trade, and ATH data |
| `multiTokenInfo` | `MultiTokenInfoParams`, then `AddressListRequest` body | `GetMultiTokenInfoResponse`: batch token profiles |
| `multiWindowTokenInfo` | `MultiWindowTokenInfoParams`, then `AddressListRequest` body | `GetMultiWindowTokenInfoResponse`: profiles and price movement across windows |
| `tokenInfoBrief` | `TokenInfoBriefParams`, then `AddressListRequest` body | `GetTokenInfoBriefResponse`: compact metadata, supply, liquidity, launchpad, honeypot flags |
| `tokenPrices` | `TokenPricesParams`, then `AddressListRequest` body | `GetTokenPricesResponse`: current batch prices |

### Token markets and trades

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `aggedTokenTrades` | `AggedTokenTradesParams`: `chain`, `token_address`; optional `period`, `tag` | `GetAggedTokenTradesResponse`: trades bucketed by time and wallet |
| `tokenCandles` | `TokenCandlesParams`: `chain`, `token_address`; optional `resolution`, `from_timestamp`, `to_timestamp`, `limit` | `GetTokenCandlesResponse`: price OHLCV |
| `mcapCandles` | `McapCandlesParams`: `chain`, `token_address`; optional `resolution`, `limit` | `GetTokenMcapCandlesResponse`: market-cap OHLCV |
| `trades` | `TradesParams`: `chain`, `token_address`; optional `maker`, `cursor` | `GetTokenTradesResponse`: newest individual trades |
| `tokenTradesV2` | `TokenTradesV2Params`: `chain`, `token_address`; optional `maker`, `cursor` | `GetTokenTradesV2Response`: 50-trade multi-region page with maker tags |
| `tokenTrends` | `TokenTrendsParams`: `chain`, `token_address`; optional `trends_types` | `GetTokenTrendsResponse`: holder-structure time series |

### Token security, social, fees, and developer data

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `devCreatedTokens` | `DevCreatedTokensParams`: `chain`, `wallet_address` | `GetDevCreatedTokensResponse`: tokens launched by a developer and their ATHs |
| `tokenAiNarrative` | `TokenAiNarrativeParams`: `chain`, `token_address` | `GetTokenAiNarrativeResponse`: generated token narrative |
| `tokenBundlerStat` | `TokenBundlerStatParams`: `chain`, `token_address` | `GetTokenBundlerStatResponse`: bundler wallets, swaps, holdings, ratios, volume |
| `tokenCommunityMessages` | `TokenCommunityMessagesParams`: `chain`, `token_address`; optional `limit` | `GetTokenCommunityMessagesResponse`: GMGN feed messages and authors |
| `tokenDevInfo` | `TokenDevInfoParams`: `chain`, `token_address` | `GetTokenDevInfoResponse`: creator status, holdings, promotion, and launch history |
| `tokenFeeDistribution` | `TokenFeeDistributionParams`: `chain`, `token_address` | `GetTokenFeeDistributionResponse`: launchpad fee split and claims |
| `tokenFeeInfo` | `TokenFeeInfoParams`: `chain`, `token_address` | `GetTokenFeeInfoResponse`: pool fees plus security and launchpad summary |
| `livePreview` | `LivePreviewParams`: `chain`, `token_address` | `GetLiveTokenPreviewResponse`: token live-stream card |
| `tokenLogoHistory` | `TokenLogoHistoryParams`: `chain`, `token_address` | `GetTokenLogoHistoryResponse`: historical logos and timestamps |
| `poolFeeInfo` | `PoolFeeInfoParams`: `chain`, `token_address` | `GetTokenPoolFeeInfoResponse`: fee setup for every trading pool |
| `recommendSlippage` | `RecommendSlippageParams`: `chain`, `token_address` | `GetRecommendSlippageResponse`: buy/sell slippage, tax flag, volatility |
| `security` | `SecurityParams`: `chain`, `token_address` | `GetTokenSecurityResponse`: contract checks and launchpad |
| `socials` | `SocialsParams`: `chain`, `token_address` | `GetTokenSocialsResponse`: social links, votes, and rug check |
| `stats` | `StatsParams`: `chain`, `token_address` | `GetTokenStatsResponse`: holder quality, concentration, bots, creator share |
| `websiteInfo` | `WebsiteInfoParams`: `chain`, `token_address` | `GetWebsiteInfoResponse`: declared URL, resolved IP, first-seen time |

### Holders, traders, and liquidity

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `tokenHolderExtraInfo` | `TokenHolderExtraInfoParams`: `chain`, `token_address`, `wallet_addresses` | `GetTokenHolderExtraInfoResponse`: holder funding trails, balances, ages, tags |
| `holderStat` | `HolderStatParams`: `chain`, `token_address` | `GetTokenHolderStatResponse`: holder cohort counts |
| `holders` | `HoldersParams`: `chain`, `token_address`; optional `limit`, `cost`, `order_by`, `direction`, `tag`, `cursor` | `GetTokenHoldersResponse`: sortable, filterable holder page |
| `liquidity` | `LiquidityParams`: `chain`, `token_address`; optional `limit`, `cursor` | `GetTokenLiquidityResponse`: add/remove events on Solana |
| `tokenLiquidityStats` | `TokenLiquidityStatsParams`: `chain`, `token_address` | `GetTokenLiquidityStatsResponse`: liquidity-provider cohort counts |
| `tokenLiquidityTrend` | `TokenLiquidityTrendParams`: `chain`, `token_address` | `GetTokenLiquidityTrendResponse`: pool size and count on Solana |
| `topBuyers` | `TopBuyersParams`: `chain`, `token_address` | `GetTopBuyersResponse`: earliest large buyers and current status |
| `traderStat` | `TraderStatParams`: `chain`, `token_address` | `GetTokenTraderStatResponse`: trader cohort counts |
| `traders` | `TradersParams`: `chain`, `token_address`; optional `limit`, `order_by`, `direction`, `tag`, `cursor` | `GetTokenTradersResponse`: ranked, filterable trader page |
| `walletTagsStat` | `WalletTagsStatParams`: `chain`, `token_address` | `GetTokenWalletTagsStatResponse`: wallet cohort counts among holders |

### Wallet analytics

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `aggedTokenTransfers` | `AggedTokenTransfersParams`: `chain`, `token_address`, `wallet_address`; optional `period` | `GetAggedTokenTransfersResponse`: wallet transfers bucketed by time |
| `nativeTransfer` | `NativeTransferParams`: `chain`, `wallet_address` | `GetNativeTransferResponse`: native-token funding transfer |
| `smartMoneyWalletInfo` | `SmartMoneyWalletInfoParams`: `chain`, `wallet_address` | `GetSmartMoneyWalletInfoResponse`: labels, socials, aggregate performance |
| `walletActivity` | `WalletActivityParams`: `chain`, `wallet_address`; optional `limit`, `type`, `cursor` | `GetWalletActivityResponse`: swaps and liquidity events |
| `walletChainBalances` | `WalletChainBalancesParams`: `chain`, `wallet_address` | `GetWalletChainBalancesResponse`: native balance and token count across chains |
| `walletCommonStat` | `WalletCommonStatParams`: `chain`, `wallet_address` | `GetWalletCommonStatResponse`: identity, provenance, socials, funder |
| `walletPnl` | `WalletPnlParams`: `chain`, `wallet_address`; optional `period` | `GetSmartMoneyWalletResponse`: full smart-money P&L and risk flags |
| `walletStat` | `WalletStatParams`: `chain`, `wallet_address`; optional `period` | `GetWalletStatResponse`: broadly available wallet P&L window |

## Find tokens and rankings

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const trending = await tapline.gmgn.trendingTokens({
  requests: [{ chain: 'sol', interval: '1h', limit: 20 }],
});
const matches = await tapline.gmgn.search({ chain: 'sol', q: 'bonk' });
const newPairs = await tapline.gmgn.newPairs({ chain: 'sol', interval: '1h', limit: 20 });
const wallets = await tapline.gmgn.walletRankings({ chain: 'sol', period: '7d' });

console.log(matches.data.coins.map((coin) => coin.symbol));
console.log(trending.data.length, newPairs.data.pairs.length, wallets.data.rank.length);
```

## Check token security and price history

```ts
import { TaplineClient } from '@tapline/client';

const token = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
const tapline = new TaplineClient();

const security = await tapline.gmgn.security({ chain: 'sol', token_address: token });
const candles = await tapline.gmgn.tokenCandles({
  chain: 'sol',
  token_address: token,
  resolution: '1h',
  limit: 48,
});
const prices = await tapline.gmgn.tokenPrices(
  { chain: 'sol' },
  { addresses: [token] },
);

console.log(security.data.security);
console.log(candles.data.list.length, prices.data.list.length);
```

## Inspect holders, traders, and liquidity

```ts
import { TaplineClient } from '@tapline/client';

const token = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
const tapline = new TaplineClient();

const holders = await tapline.gmgn.holders({ chain: 'sol', token_address: token, limit: 20 });
const traders = await tapline.gmgn.traders({ chain: 'sol', token_address: token, limit: 20 });
const liquidity = await tapline.gmgn.liquidity({ chain: 'sol', token_address: token, limit: 20 });

console.log(holders.data.list.length, traders.data.list.length, liquidity.data.history.length);
```

`liquidity` and `tokenLiquidityTrend` are Solana-only. Use `tokenLiquidityStats` for cohort coverage on other supported chains.

## Analyze a wallet

```ts
import { TaplineClient } from '@tapline/client';

const wallet = 'suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK';
const tapline = new TaplineClient();

const pnl = await tapline.gmgn.walletStat({ chain: 'sol', wallet_address: wallet, period: '7d' });
const activity = await tapline.gmgn.walletActivity({ chain: 'sol', wallet_address: wallet, limit: 20 });
const identity = await tapline.gmgn.walletCommonStat({ chain: 'sol', wallet_address: wallet });

console.log(pnl.data.realized_profit, pnl.data.realized_profit_pnl);
console.log(activity.data.activities.length, identity.data.name);
```

`walletPnl` and `smartMoneyWalletInfo` use GMGN's narrower smart-money backend. `walletStat` covers every GMGN chain and is the general fallback.

Pass cursor values back unchanged when you fetch another page.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). The [GMGN API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=gmgn_readme#/gmgn) lists the inputs, response fields, limits, and credit cost for each method.
