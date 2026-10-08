# @tapline/client

Use `@tapline/client` to collect live data from YouTube, Airbnb, GMGN, GeckoTerminal, GoPlus Security, Pons Family, Twitter (X), and Pinterest in TypeScript or JavaScript.

## What you can do

| Service | Use it to | Full guide |
| --- | --- | --- |
| YouTube | Get transcripts, search videos, read video and channel details, list playlists, collect comments, inspect formats, and read replay heatmaps | [YouTube guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/youtube/README.md) |
| Airbnb | Find locations and listings, check prices and availability, and read listing details and reviews | [Airbnb guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/airbnb/README.md) |
| GMGN | Find tokens, check security and market data, inspect holders and traders, and analyze wallets | [GMGN guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/gmgn/README.md) |
| GeckoTerminal | Find pools, read candlesticks and swaps, inspect holders and traders, and follow market trends | [GeckoTerminal guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/geckoterminal/README.md) |
| GoPlus Security | Check EVM and Tron tokens and Solana mints for honeypots, taxes, owner and mint powers, holders, and liquidity | [GoPlus guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/goplus/README.md) |
| Pons Family | Browse and search launches, read token markets, trades and holders, follow wallets and creator fees, and read the memestock forum | [Pons Family guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/ponsfamily/README.md) |
| Twitter (X) | Read public X profiles by handle or id, an account's newest posts, single posts with media and quotes, and X Communities with their top posts | [Twitter guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/twitter/README.md) |
| Pinterest | Search pins, read one pin with every image size, its video and idea-pin pages, list a user's boards, and read the pins on a board | [Pinterest guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/pinterest/README.md) |

One API key and credit balance work across all eight services.

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=main_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=main_readme).

Install the package and save your key in `TAPLINE_API_KEY`:

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

Pass a key from your server's environment or secret manager as `apiKey` when you create the client:

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient({
  apiKey: process.env.TAPLINE_API_KEY,
});
```

If you omit `apiKey`, the client reads `TAPLINE_API_KEY` in Node.js. Keep the key on your server. Do not put it in browser code.

## Get a YouTube transcript

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const subtitles = await tapline.youtube.getSubtitles({
  video_id: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  language: 'en',
  subtitle_format: 'txt',
});

console.log(subtitles.transcript);
```

See the [YouTube guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/youtube/README.md) for search, metadata, channels, playlists, comments, formats, and replay heatmaps.

## Search Airbnb listings

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const places = await tapline.airbnb.searchLocations({ query: 'London' });
const placeId = places.suggestions[0].place_id;
if (!placeId) throw new Error('Airbnb returned a location without a place_id');
const results = await tapline.airbnb.search({
  place_id: placeId,
  adults: 2,
});

for (const listing of results.listings) {
  console.log(listing.room_id, listing.name);
}
```

Listing IDs can stop resolving when a host removes a property. See the [Airbnb guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/airbnb/README.md) for prices, availability, details, reviews, and search filters.

## Search GMGN token data

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const results = await tapline.gmgn.search({ chain: 'sol', q: 'bonk' });

for (const token of results.data.coins.slice(0, 5)) {
  console.log(token.symbol, token.address);
}
```

See the [GMGN guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/gmgn/README.md) for discovery, rankings, security, candles, holders, traders, liquidity, and wallet analytics.

## Discover GeckoTerminal pools

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const pools = await tapline.geckoterminal.networkLatestPools({ network: 'solana' });

for (const pool of pools.data.slice(0, 5)) {
  console.log(pool.attributes.address, pool.attributes.name);
}
```

See the [GeckoTerminal guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/geckoterminal/README.md) for pool, token, trend, and developer history data.

## Check token security with GoPlus

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const address = '0x6982508145454ce325ddbe47a25d4ec3d2311933';
const security = await tapline.goplus.getEvmTokenSecurity({ chain_id: '1', address });
const token = security.result?.[address];

if (token === undefined) {
  console.log('GoPlus has no token at this address on this chain');
} else {
  console.log(token.token_symbol, token.is_honeypot, token.buy_tax, token.sell_tax);
}
```

`chain_id` takes any of the 43 EVM chains GoPlus supports, such as `'56'` for BNB Chain or `'42161'` for Arbitrum. `result` is empty when GoPlus has no token at that address on that chain. Each call costs 3 credits, even one that comes back empty. `""` means GoPlus does not know a value, so do not read it as zero. See the [GoPlus guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/goplus/README.md) for Solana mints, Tron tokens, and how to read the response.

## Browse Pons Family launches

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const board = await tapline.ponsfamily.listLaunches({ sort: 'volume', page_size: 5 });

for (const launch of board.active?.items ?? []) {
  console.log(launch.symbol, launch.token, launch.marketCapUsd);
}
```

See the [Pons Family guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/ponsfamily/README.md) for token markets, charts, holders, wallets, creator fees, and the memestock forum.

## Go beyond the free tier

Your free account starts with 500 credits and can use every live endpoint. When you need more credits or higher rate limits, choose a paid plan under [Billing](https://tapline.sh/dashboard?tab=billing&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=main_readme). Your API key and code stay the same.

## Handle errors

Failed requests throw `TaplineError`. Use its status, error code, and request ID to decide what to do or to contact support.

```ts
import { TaplineClient, TaplineError } from '@tapline/client';

try {
  await new TaplineClient().youtube.getMetadata({ video_id: 'not-a-video' });
} catch (error) {
  if (error instanceof TaplineError) {
    console.error(error.status, error.code, error.requestId);
  }
}
```

The client retries temporary network and server failures. Large integers arrive as strings when JavaScript cannot store them without rounding.

## Full API reference

Use the [Tapline API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=main_readme) to check inputs, response fields, and the credit cost of each call.

- [YouTube](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/youtube/README.md)
- [Airbnb](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/airbnb/README.md)
- [GMGN](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/gmgn/README.md)
- [GeckoTerminal](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/geckoterminal/README.md)
- [GoPlus Security](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/goplus/README.md)
- [Pons Family](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/ponsfamily/README.md)
- [Twitter (X)](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/twitter/README.md)
- [Pinterest](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/pinterest/README.md)

## License

MIT
