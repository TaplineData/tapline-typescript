# @tapline/client

The official TypeScript client for the [Tapline](https://tapline.sh) API:
parsed, versioned JSON from live Airbnb, YouTube, GMGN and GeckoTerminal, one
API key, one credit pool.

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();

const places = await tapline.airbnb.searchLocations({ query: 'London' });
const results = await tapline.airbnb.search({ place_id: places.suggestions[0].place_id, adults: 2 });

const video = await tapline.youtube.getMetadata({ video_id: 'dQw4w9WgXcQ' });
const comments = await tapline.youtube.getComments({ video_id: 'dQw4w9WgXcQ' });

const token = await tapline.gmgn.search({ chain: 'sol', q: 'bonk' });

const pools = await tapline.geckoterminal.networkLatestPools({ network: 'solana' });
const stats = await tapline.geckoterminal.globalStats();
```

`TaplineClient` reads `TAPLINE_API_KEY` and `TAPLINE_BASE_URL` from the
environment, or takes `apiKey` and `baseUrl` in its constructor. Every method
takes the request body or parameters the API documents, under the same field
names, and resolves to the documented response type. Types are exported per
service:

```ts
import type { airbnb, youtube, gmgn, geckoterminal } from '@tapline/client';

let listing: airbnb.ParsedListing;
let channel: youtube.ChannelResponse;
let trending: gmgn.TrendingToken;
let pool: geckoterminal.PoolResponse;
```

Failed requests throw `TaplineError` with `status`, `code`, `requestId` and the
server's `message`. Requests that fail with a 429 or a 5xx are retried with
backoff, honouring `Retry-After`. Integers too large for a JavaScript number
arrive as strings instead of being rounded.

The service types, sub-clients and the root client are generated from the
API's OpenAPI document; `src/base.ts` and `src/errors.ts` are written by hand.

MIT licensed.
