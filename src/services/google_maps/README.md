# Google Maps with the Tapline TypeScript SDK

Use the Google Maps client to search places, read a place with its reviews, photos, owner posts and popular times, get directions and search suggestions, find the address at a point, and read contributors, shared lists, Street View panoramas, area traffic and weather.

[Package guide](../../../README.md) · [Google Maps API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=google_maps_readme#/google_maps)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=google_maps_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=google_maps_readme).

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

Every method except `getPlaceIds` and `getShareLink` takes `hl`, the language of the answer's text (`en` by default), and `gl`, the region that sets ranking, currency and units (`us` by default).

| Method | Key inputs | Returns | Credits |
| --- | --- | --- | --- |
| `search` | `query`, `latitude` and `longitude`, `zoom`, `open_now`, `min_rating`, `limit` (up to 100), `cursor` | places for a Maps search | 3 |
| `getPlace` | `feature_id` | one place | 2 |
| `getPlaceByCid` | `cid` | one place | 2 |
| `getPlaceIds` | `place_id` | the feature id and CID for a Google place id | 2 |
| `listReviews` | `feature_id`, `sort`, `limit` (up to 60), `cursor` | a page of a place's reviews | 2 |
| `listPhotos` | `feature_id`, `category`, `limit` (up to 10), `cursor` | a page of photos from one photo tab | 1 |
| `listPosts` | `feature_id` | a business's latest owner posts, up to 10 | 1 |
| `getPhoto` | `photo_id` | one photo or video | 1 |
| `getDirections` | `origin`, `destination`, `travel_mode` | routes between two places | 2 |
| `listSuggestions` | `query`, `latitude` and `longitude` | places and queries for partly typed text | 1 |
| `getContributor` | `contributor_id`, `limit` (up to 50) | a contributor's profile with their latest reviews and photos | 4 |
| `reverseGeocode` | `latitude`, `longitude` | the address and place at a coordinate | 1 |
| `getPopularTimes` | `kgmid` | a place's busyness by hour for each day | 7 |
| `getList` | `list_id` | a public shared list and its places | 1 |
| `getShareLink` | `code` | the place or list a `maps.app.goo.gl` link opens | 1 |
| `getPanorama` | `pano_id` | one Street View panorama | 1 |
| `listPanoramasNear` | `latitude`, `longitude` | the Street View panoramas near a coordinate | 1 |
| `getTraffic` | `south`, `west`, `north`, `east` (`west` above `east` crosses 180°) | the traffic summary for a box up to 1 degree a side | 1 |
| `getWeather` | `latitude`, `longitude` | the current weather at a coordinate | 1 |

Paged methods cost their credits per page, not per item.

## Search places

```ts
let cursor = '';
for (let pages = 0; pages < 3; pages += 1) {
  const page = await tapline.googleMaps.search({
    query: 'coffee in Austin TX',
    open_now: true,
    min_rating: 4.5,
    cursor,
  });
  for (const place of page.results) {
    console.log(place.name, place.rating, place.review_count, place.feature_id);
  }
  cursor = page.pagination.next_cursor ?? '';
  if (!cursor) break;
}
```

## Read a place and its newest reviews

```ts
const josCoffee = '0x8644b4fda2c12fd5:0x66b58cb4722b37b';

const place = await tapline.googleMaps.getPlace({ feature_id: josCoffee });
console.log(place.name, place.address, place.rating, place.open_status);

const reviews = await tapline.googleMaps.listReviews({ feature_id: josCoffee, sort: 'newest' });
for (const review of reviews.reviews) {
  console.log(review.rating, review.created_at, review.text);
}
```

## Get directions

```ts
const directions = await tapline.googleMaps.getDirections({
  origin: 'Austin-Bergstrom International Airport',
  destination: "Jo's Coffee South Congress, Austin, TX",
  travel_mode: 'transit',
});
for (const route of directions.routes) {
  if (route.duration) console.log(route.name, route.duration.text);
}
```

## Read the response

- Places are keyed by `feature_id` (`0x…:0x…`). `getPlaceByCid` and `getPlaceIds` look a place up by its CID or Google place id; only `ChIJ…` place ids resolve, so address and coordinate ids answer 404. `getPopularTimes` takes the `kgmid` from a search result or a place.
- Paged methods return `pagination`. Pass `pagination.next_cursor` back as `cursor` until it is null. A cursor works only for the search or place that issued it.
- Google reranks search results between calls, so later pages leave out places earlier pages returned and can miss a few that moved.
- Some text is read only in English: hotel check-in and check-out times on `search` and the place methods, and `typical_visit` and `social_posts` on `getPopularTimes`.
- `getWeather` answers in °F for `gl: 'us'` and in °C for most other regions.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors and cursors this API did not issue are not charged, and neither is a 503 when Google blocks every attempt. An id Google does not know answers 404 and is charged. `listReviews` and `listPosts` can't tell an unknown place from one with no reviews or posts: both answer an empty page, and the call is charged.

The [Google Maps API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=google_maps_readme#/google_maps) lists the inputs, response fields, and credit cost for each method.
