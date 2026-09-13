# @tapline/client

Use `@tapline/client` to collect live data from YouTube, Airbnb, GMGN, and GeckoTerminal in TypeScript or JavaScript.

## What you can do

| Service | Use it to | Full guide |
| --- | --- | --- |
| YouTube | Get transcripts, search videos, read video and channel details, list playlists, collect comments, inspect formats, and read replay heatmaps | [YouTube guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/youtube/README.md) |
| Airbnb | Find locations and listings, check prices and availability, and read listing details and reviews | [Airbnb guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/airbnb/README.md) |
| GMGN | Find tokens, check security and market data, inspect holders and traders, and analyze wallets | [GMGN guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/gmgn/README.md) |
| GeckoTerminal | Find pools, read candlesticks and swaps, inspect holders and traders, and follow market trends | [GeckoTerminal guide](https://github.com/TaplineData/tapline-typescript/blob/main/src/services/geckoterminal/README.md) |

One API key and credit balance work across all four services.

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

## License

MIT
