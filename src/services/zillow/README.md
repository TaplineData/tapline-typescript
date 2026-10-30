# Zillow with the Tapline TypeScript SDK

Use the Zillow client to read US homes for sale, for rent and recently sold on Zillow, with their price and tax records, agents, schools, value history and comparables.

[Package guide](../../../README.md) · [Zillow API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=zillow_readme#/zillow)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=zillow_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=zillow_readme).

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

The property methods take `zpid`, Zillow's property id. It is the number before `_zpid` in a home's Zillow URL.

| Method | Key inputs | Credits | Returns |
| --- | --- | --- | --- |
| `searchHomes` | `location` or `region_id`, `status`, `sort`, the filters, `cursor` | 3 | up to 41 homes per page with price, facts, address, photos and broker, plus the region searched |
| `getProperty` | `zpid` | 2 | one home: status, price, Zestimates, facts and features, photos, listing agent and Zillow's home insights |
| `getPropertyRecords` | `zpid` | 1 | the home's price history with agents, last sale, tax history, listing and buyer attribution, schools and nearby homes |
| `getPropertyHistory` | `zpid`, `metric`, `period` | 1 | one series: Zestimate, rent Zestimate, value change, tax paid or assessed value |
| `listComparables` | `zpid` | 1 | the comparable homes behind the Zestimate |
| `searchLocations` | `query`, `type`, `limit` | 1 | regions and addresses matching partly typed text, with region ids and zpids |

`searchHomes` costs its credits per page.

## Search homes and page through them

```ts
let cursor = '';
do {
  const page = await tapline.zillow.searchHomes({
    location: 'Austin, TX',
    status: 'for_sale',
    min_beds: 3,
    max_price: 600000,
    cursor,
  });
  for (const listing of page.items) {
    console.log(listing.zpid, listing.formattedPrice, listing.address.display, listing.bedrooms);
  }
  cursor = page.pagination.next_cursor ?? '';
} while (cursor);
```

Send the same location and filters with every cursor. Zillow serves 20 pages of 41 homes at most. `pagination.completion` is `depth_limit` on page 20 and `exhausted` on a true last page, so narrow the filters when `total_results` is above 820.

`location` takes what you would type into Zillow, such as `Austin, TX`, `94110` or `Brooklyn`, and `region` in the answer says which region Zillow matched. To search one exact region, pass `searchLocations`' `metaData.regionId` and `metaData.regionType` as `region_id` and `region_type`.

## Read a property

```ts
const home = await tapline.zillow.getProperty({ zpid: 15067360 });
console.log(home.homeStatus, home.price, home.zestimate, home.rentZestimate);
console.log(home.address?.streetAddress, home.bedrooms, home.bathrooms, home.livingArea);
console.log(home.attributionInfo?.agentName, home.attributionInfo?.brokerName);
```

Every `zpid` in a response is a string, so pass a search result's as `Number(listing.zpid)`.

## Read its price and tax records

```ts
const records = await tapline.zillow.getPropertyRecords({ zpid: 15067360 });
console.log(records.lastSoldPrice, records.dateSold);
for (const event of records.priceHistory) {
  console.log(event.date, event.event, event.price, event.sellerAgent?.name, event.buyerAgent?.name);
}
for (const tax of records.taxHistory ?? []) console.log(tax.time, tax.taxPaid, tax.value);
for (const school of records.schools) console.log(school.name, school.level, school.rating, school.isAssigned);
```

## Read the response

- Most fields keep Zillow's camelCase names. A few that this API names use snake_case, such as `is_price_disclosed`, `node_id` and `total_pages`.
- In search results, `price` is a number and `formattedPrice` Zillow's text for it. `is_price_disclosed` is false when the listing asks you to request the price.
- Rental buildings in search have `isBuilding` set, a coordinate key in `zpid` instead of a property id, and their rents by bedroom count in `units`.
- Times are Unix milliseconds: `dateSold`, `priceHistory[].time`, `taxHistory[].time` and the `x` of history points. A tax entry's `time` is the start of its tax year.
- In states that keep sale prices private, such as Texas, a sold home's search `price`, its `Sold` events and `lastSoldPrice` are null.
- `getProperty` returns the price history Zillow's page carries, which is empty for many homes. `getPropertyRecords` returns every event with its buyer's and seller's agent.
- `schools` lists each school once. `isAssigned` marks the ones the home is zoned for, and `resoFacts` holds the MLS's school assignment when the listing names one.
- `getPropertyHistory` with `metric: 'tax_assessment'` returns two series, `Land` and `Structure`.
- `node_id` is Zillow's GraphQL id for the property, not a zpid.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors), including 401 `unauthenticated`, 402 `insufficient_credits`, 403 `forbidden`, 429 `rate_limited` and 500 `internal_error`. Validation errors answer 422 `invalid_request` and are not charged: a `zpid` that is not a Zillow property id, an unknown enum value, a minimum above its maximum, or a `limit` above 12 on `searchLocations`. A cursor this API did not issue, or one past the last page, answers 400 `invalid_cursor` and is not charged. A zpid Zillow has no home for answers 404 `not_found` and is charged; `getPropertyHistory` and `listComparables` answer some unknown zpids with an empty `series` or `items` instead. On `searchHomes`, a `location` Zillow cannot match to a region, or matches only to a custom area such as `Bay Area`, answers 404 and is charged. When Zillow blocks every proxy attempt, is down or answers a page without its data, the call answers 503 (`upstream_blocked`, `upstream_unavailable` or `upstream_response_invalid`) and is not charged; retry it.

The [Zillow API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=zillow_readme#/zillow) lists the inputs, response fields, and credit cost for each method.
