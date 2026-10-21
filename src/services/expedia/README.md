# Expedia with the Tapline TypeScript SDK

Use the Expedia client to read expedia.com: search hotels and vacation homes for your dates and guests, read a hotel's address, star rating, amenities, policies and photos, page through its guest reviews, and price every room and rate plan for a stay.

[Package guide](../../../README.md) · [Expedia API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=expedia_readme#/expedia)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=expedia_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=expedia_readme).

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

Stays take `check_in` and `check_out` (`YYYY-MM-DD`, at most 28 nights), `adults` (default 2) and `children_ages`, one age per child. Prices are in USD.

| Method | Key inputs | Returns | Credits |
| --- | --- | --- | --- |
| `searchLocations` | `query`, `limit` (up to 10) | cities, neighborhoods, airports and landmarks with the `region_id` to search with | 1 |
| `searchHotels` | `region_id`, the stay, `sort`, price, star rating, guest rating, property type, amenity and meal-plan filters, `cursor` | 25 hotels per page with price, guest rating, review count, badges, photos and a booking link | 4 |
| `getHotel` | `hotel_id` | name, star rating, address, coordinates, guest rating, amenities by category, check-out time and house policies, photo gallery | 2 |
| `listHotelReviews` | `hotel_id`, `sort`, `cursor` | 10 reviews per page with score, text, date, stay, author, photos and the hotel's replies | 2 |
| `listHotelRooms` | `hotel_id`, the stay | every room type with its features and photos, and each rate plan's prices per payment option and cancellation terms | 3 |

Paged methods cost their credits per page, not per item.

## Find a region and search it

```ts
const locations = await tapline.expedia.searchLocations({ query: 'new york' });
const region = locations.locations.find((location) => location.type === 'CITY');

let cursor = '';
do {
  const page = await tapline.expedia.searchHotels({
    region_id: region?.region_id ?? '2621',
    check_in: '2026-12-14',
    check_out: '2026-12-16',
    star_ratings: [4, 5],
    sort: 'price_low_to_high',
    cursor,
  });
  for (const hotel of page.hotels) {
    console.log(hotel.id, hotel.name, hotel.price?.total.amount, hotel.guest_rating.score);
  }
  cursor = page.pagination.next_cursor ?? '';
} while (cursor);
```

## Price the rooms of one hotel

```ts
const rooms = await tapline.expedia.listHotelRooms({
  hotel_id: '19681371',
  check_in: '2026-12-14',
  check_out: '2026-12-16',
  adults: 2,
});
for (const room of rooms.rooms) {
  for (const plan of room.rate_plans) {
    for (const price of plan.prices) {
      console.log(room.name, plan.id, price.payment_model, price.total.formatted, plan.cancellation_policy);
    }
  }
}
```

## Read the response

- `price.total` is the whole stay with taxes and fees, as an exact amount. `price.nightly` is Expedia's displayed nightly rate before taxes, rounded to whole dollars.
- `price` is `null` on a search card when Expedia shows no bookable rate for your dates or party.
- Search cards carry no star rating or coordinates; `getHotel` has both.
- `subtitles` on a search card are Expedia's heading lines as shown: a neighborhood for hotels, "Entire home by Vrbo" for many vacation homes.
- `total_count` is Expedia's own estimate and can move when you add filters.
- `strikethrough` is the whole stay's earlier total, comparable with `total`, not with `nightly`.
- An empty `cancellation_policy` means the plan is non-refundable. Two plans of one room can differ by extras Expedia does not name in this view.
- `listHotelReviews` and `listHotelRooms` answer an empty list for a `hotel_id` Expedia does not know, as they do for a hotel with no reviews. A room Expedia cannot sell for your dates or party comes back with empty `rate_plans`. `getHotel` answers 404 for it.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors (past or over-long dates, an unknown enum value, a minimum price above its maximum, a cursor this API did not issue) are not charged. An unknown hotel on `getHotel` answers 404 and is charged. Blocks and upstream failures answer 503 and are not charged.

The [Expedia API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=expedia_readme#/expedia) lists the inputs, response fields, and credit cost for each method.
