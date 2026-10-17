# imovelweb with the Tapline TypeScript SDK

Use the imovelweb client to read imovelweb.com.br, Brazil's QuintoAndar-owned property portal: search homes and commercial property for sale, rent, short stays, auction and new developments, plot a search on a map, read full listings, and get each agency's phone numbers and buyer ratings.

[Package guide](../../../README.md) · [imovelweb API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=imovelweb_readme#/imovelweb)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=imovelweb_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=imovelweb_readme).

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

Search and map take the same filters: `operation` (`sale`, `rent`, `season`, `auction`, `development`), `location_id`, property type and subtype, price, condo fee, bedrooms, bathrooms, parking, total and usable area, age, publication date, publisher type or id, amenities, media and a keyword.

| Method | Key inputs | Returns | Credits |
| --- | --- | --- | --- |
| `listLocations` | `query`, `limit` (up to 10) | state, city and neighbourhood ids to search with | 1 |
| `listListings` | the filters, `sort`, `cursor` | 30 listings per page with prices, condo fee, areas, rooms, address, coordinates, photos, the agency and the advertiser's WhatsApp number | 2 |
| `mapListings` | the filters | up to 100 map markers, the count imovelweb can place, the viewport and the location's outline | 1 |
| `getListing` | `posting_id` | the full listing: description, every photo and floor plan, amenities, prices, coordinates, publication date, a development's units | 2 |
| `listSimilarListings` | `posting_id`, `limit` | listings imovelweb shows as similar | 1 |
| `listListingPublishers` | `posting_id` | every agency advertising the same property | 1 |
| `getPublisher` | `publisher_id` | an agency's profile: phone numbers as +55 numbers, address, year joined, active listing count and buyer ratings | 2 |

Paged methods cost their credits per page, not per item.

## Find a location id

```ts
const suggestions = await tapline.imovelweb.listLocations({ query: 'pinheiros' });
for (const location of suggestions.locations) {
  console.log(location.id, location.level, location.labelSuggest);
}
```

`V1-Z-52` is Pinheiros in São Paulo. Pass several ids to `location_id` and listings in any of them match.

## Page through rentals

```ts
let cursor = '';
do {
  const page = await tapline.imovelweb.listListings({
    operation: 'rent',
    location_id: ['V1-Z-52'],
    min_bedrooms: 2,
    cursor,
  });
  for (const listing of page.listings) {
    console.log(listing.postingId, listing.title, listing.publisher.name, listing.whatsApp);
  }
  cursor = page.pagination.next_cursor ?? '';
} while (cursor);
```

## Get an agency's phone numbers

```ts
const agency = await tapline.imovelweb.getPublisher({ publisher_id: '15460167' });
console.log(agency.denomination, agency.phoneNumbers, agency.address);
if (agency.ratings) console.log(agency.ratings.average, agency.ratings.respondedCount);
```

Take the id from `publisher.publisherId` on a search listing.

## Read the response

- Listings keep imovelweb's own keys, some of them Spanish. Each operation a listing is offered for has its own entry in `priceOperationTypes`, priced in R$.
- `pagination.completion` is `exhausted` at the end, or `depth_limit` at page 1,000 (30,000 listings). Narrow the filters to reach the rest.
- About a fifth of search listings hide their map position (`postingGeolocation` is null). `getListing` usually still has coordinates.
- Search listings carry `publisherTypeId` as a string (`'1'` is an owner selling directly). Owners have no profile, so `getPublisher` answers 404 for them and the listing's `whatsApp` is their contact.
- `getListing` gives only the first digits of the agency's phone (`partialPhone`). `getPublisher` has every number.
- Fields typed `unknown` were null in every answer imovelweb gave us, so their shape is unknown.
- `ratings` is null when imovelweb keeps no statistics for an agency. An unrated agency has null `respondedCount` and `ratings` and an `average` of 0.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors (an unknown enum value, a subtype without its type, a minimum above its maximum, a cursor this API did not issue) are not charged. A location id imovelweb does not know answers 400 `invalid_request` naming it, and is not charged. `mapListings` answers 400 on filters imovelweb's map cannot run across the whole country or a state; narrow to a city or neighbourhood. An unknown listing or publisher id answers 404 and is charged.

The [imovelweb API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=imovelweb_readme#/imovelweb) lists the inputs, response fields, and credit cost for each method.
