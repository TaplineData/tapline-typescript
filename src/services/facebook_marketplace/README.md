# Facebook Marketplace with the Tapline TypeScript SDK

Use the Facebook Marketplace client to find Marketplace locations, search and browse listings around a point, read a listing with its seller and photos, and map rentals. Pages, posts and groups are in the [Facebook client](../facebook/README.md).

[Package guide](../../../README.md) · [Facebook Marketplace API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_marketplace_readme#/facebook_marketplace)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_marketplace_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_marketplace_readme).

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

| Method | Inputs | Returns | Credits |
| --- | --- | --- | --- |
| `searchMarketplaceLocations` | `query` | places with the coordinates Marketplace takes | 3 |
| `searchMarketplace` | `query`, `latitude`, `longitude`, `cursor`, `radius_km`, `min_price`, `max_price`, `condition`, `days_since_listed`, `delivery`, `sort` | listings around a point | 3 |
| `getMarketplaceCategories` |  | categories and subcategories | 3 |
| `listMarketplaceCategoryListings` | `category`, `latitude`, `longitude`, `cursor`, `radius_km`, `min_price`, `max_price` | one category's listings around a point | 3 |
| `listMarketplaceFeed` | `latitude`, `longitude`, `cursor`, `radius_km` | the Marketplace home feed | 3 |
| `getMarketplaceListing` | `listing_id` | one listing with its seller | 4 |
| `listMarketplaceListingPhotos` | `listing_id` | every photo and video of a listing | 3 |
| `listMarketplaceRentals` | `latitude`, `longitude`, `radius_km`, `min_price`, `max_price` | rental map clusters with a count each | 3 |

Paged methods cost their credits per page.

## Search Marketplace

```ts
const places = await tapline.facebookMarketplace.searchMarketplaceLocations({ query: 'Austin, TX' });
const austin = places.locations[0];
const listings = await tapline.facebookMarketplace.searchMarketplace({
  query: 'bike',
  latitude: austin.latitude!,
  longitude: austin.longitude!,
  max_price: 300,
});
for (const listing of listings.listings) console.log(listing.title, listing.price?.formatted);
```

`min_price` and `max_price` are whole units of the local currency. A search page can come back empty with a `next_cursor`; keep paging. A cursor works only with the method and inputs that issued it.

## Read a listing

```ts
const listing = await tapline.facebookMarketplace.getMarketplaceListing({ listing_id: '4498962133715634' });
const media = await tapline.facebookMarketplace.listMarketplaceListingPhotos({ listing_id: '4498962133715634' });
console.log(listing.title, media.photos.length, media.videos.length);
```

## Read the response

- Facebook's enum values arrive as `{code, label}`: `code` is Facebook's value and `label` says what it means.
- Listing photos and videos carry their id, image or playable URL, size and thumbnail.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors are not charged: `min_price` above `max_price`, or a cursor from another method or other inputs. A listing id Facebook does not know answers 404 and is charged. When Facebook refuses every proxy attempt the call answers 503 and is not charged.

The [Facebook Marketplace API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_marketplace_readme#/facebook_marketplace) lists the inputs, response fields, and credit cost for each method.
