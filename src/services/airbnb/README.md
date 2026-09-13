# Airbnb with the Tapline TypeScript SDK

Use the Airbnb client to find stays, check prices and availability, and read listing details and reviews.

[Package guide](../../../README.md) · [Airbnb API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=airbnb_readme#/airbnb)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=airbnb_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=airbnb_readme).

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

### Discovery

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `searchLocations` | `SearchLocationsParams`: `query`; optional `language` | `ParsedAutocompleteResponse` with suggestions and `place_id` values |
| `search` | `SearchRequest`: one of `place_id`, `query`, center/radius, or bounding box; optional dates, guests, price, rooms, amenities, cancellation, currency, cursor | `ParsedSearchResponse` with listings and pagination |

### Listing data

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getPrice` | `GetPriceRequest`: `room_id`, `check_in`, `check_out`; optional `adults`, `currency` | `ParsedPriceResponse` with stay and nightly pricing |
| `getCalendar` | `GetCalendarRequest`: `room_id`, `month`, `year`; optional `count`, `currency` | `ParsedCalendarResponse` with day-level availability |
| `getDetails` | `GetDetailsRequest`: `room_id` | `ParsedDetailsResponse` with listing, host, amenities, policies, and media |
| `getReviews` | `GetReviewsRequest`: `room_id`; optional `limit`, `offset`, `sort` | `ParsedReviewsResponse` with ratings and review text |

## Find a listing and check a stay

```ts
import { TaplineClient } from '@tapline/client';

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const checkIn = new Date();
checkIn.setUTCDate(checkIn.getUTCDate() + 60);
const checkOut = new Date(checkIn);
checkOut.setUTCDate(checkOut.getUTCDate() + 4);

const tapline = new TaplineClient();
const places = await tapline.airbnb.searchLocations({ query: 'London' });
const placeId = places.suggestions[0].place_id;
if (!placeId) throw new Error('Airbnb returned a location without a place_id');

const results = await tapline.airbnb.search({ place_id: placeId, adults: 2 });
const roomId = results.listings[0].room_id;
if (!roomId) throw new Error('Airbnb returned a listing without a room_id');

const price = await tapline.airbnb.getPrice({
  room_id: roomId,
  check_in: isoDate(checkIn),
  check_out: isoDate(checkOut),
  adults: 2,
});
const calendar = await tapline.airbnb.getCalendar({
  room_id: roomId,
  month: checkIn.getUTCMonth() + 1,
  year: checkIn.getUTCFullYear(),
});
const details = await tapline.airbnb.getDetails({ room_id: roomId });
const reviews = await tapline.airbnb.getReviews({ room_id: roomId, limit: 10 });

console.log(price.available, price.requested_stay_total);
console.log(calendar.months[0].days[0].available);
console.log(details.title, details.rating_summary);
console.log(reviews.total_count);
```

Airbnb can silently fall back to USD for unsupported display currencies; treat the response currency as authoritative. A listing found by search may later be removed or made unavailable.

## Search filters

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const results = await tapline.airbnb.search({
  query: 'Rio de Janeiro',
  adults: 2,
  min_bedrooms: 1,
  price_max: 300,
  amenities: ['wifi', 'air_conditioning'],
  free_cancellation: true,
});
```

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). The [Airbnb API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=airbnb_readme#/airbnb) lists the inputs, response fields, limits, and credit cost for each method.
