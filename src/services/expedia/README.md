# Expedia with the Tapline TypeScript SDK

Use the Expedia client to read expedia.com: search hotels and vacation homes for your dates and guests, read a hotel's details, reviews, rooms and price calendar, find things to do in a city or near a hotel, and search one-way, round-trip and multi-city flights with every fare family and a fare calendar.

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

Stays take `check_in` and `check_out` (`YYYY-MM-DD`, at most 28 nights), `adults` (default 2) and `children_ages`, one age per child. Flight travelers are `adults` (1 to 9, default 1), `children_ages` (2 to 17, one per child) and `infants_in_lap` (under 2, at most one per adult), 9 at most. Prices are in USD.

| Method | Key inputs | Returns | Credits |
| --- | --- | --- | --- |
| `searchLocations` | `query`, `limit` (up to 10) | cities, neighborhoods, airports and landmarks with the `region_id` to search with | 1 |
| `searchHotels` | `region_id`, the stay, `sort`, price, star rating, guest rating, property type, amenity and meal-plan filters, `cursor` | 25 hotels per page with price, guest rating, coordinates, badges, photos and a booking link | 4 |
| `getHotel` | `hotel_id` | name, star rating, region, address, coordinates, guest rating with category scores, an AI review summary, amenities, accessibility, policies, photos | 2 |
| `listHotelReviews` | `hotel_id`, `sort`, `traveler_type`, `cursor` | 10 reviews per page with score, text, date, stay, author, traveler type, liked and disliked topics, photos and replies | 2 |
| `listHotelRooms` | `hotel_id`, the stay, `region_id` | every room with its rate plans: extras such as breakfast, prices per payment option, cancellation terms, and Expedia's price signal when you pass the region | 3 |
| `getHotelCalendar` | `hotel_id`, optional stay | each day's nightly price, and for vacation homes whether you can check in or out and the night limits | 2 |
| `searchActivities` | `region_id`, `start_date`, `end_date`, `sort`, `cursor` | 20 things to do per page with price, rating, duration and a link | 2 |
| `listHotelActivities` | `hotel_id`, `start_date`, `end_date`, `sort`, `cursor` | 20 things to do per page near the hotel, with the distance to each | 2 |
| `getActivity` | `activity_id`, optional `start_date` and `end_date` | description, address, what's included, available dates, ticket prices and the latest 10 reviews | 2 |
| `searchAirports` | `query`, `limit` (up to 10) | airport and city codes to search flights with | 1 |
| `searchFlights` | `origin`, `destination`, `departure_date`, `return_date`, travelers, `cabin`, `max_stops`, `airlines`, `departure_time`, `refundable`, `sort` | up to 25 flights with segments, layovers and every fare family; a round trip returns outbound flights | 10 |
| `searchMultiCityFlights` | `legs` (2 to 5), travelers, `cabin`, filters, `sort` | up to 25 flights for the first leg | 10 |
| `searchNextLeg` | `token` (a fare's `next_leg_token`), filters, `sort` | up to 25 flights for the next leg, priced as the whole trip | 10 |
| `getFareCalendar` | `origin`, `destination`, `departure_date`, `return_date`, `cabin` | cheapest fares on nearby dates and Expedia's price prediction with price history | 2 |

Paged methods cost their credits per page. Flight searches cost theirs per call, whatever the number of flights.

## Find a region and search it

```ts
const locations = await tapline.expedia.searchLocations({ query: 'new york' });
const region = locations.locations.find((location) => location.type === 'CITY');

const page = await tapline.expedia.searchHotels({
  region_id: region?.region_id ?? '2621',
  check_in: '2026-12-14',
  check_out: '2026-12-16',
  star_ratings: [4, 5],
  sort: 'price_low_to_high',
});
for (const hotel of page.hotels) {
  console.log(hotel.id, hotel.name, hotel.price?.total.amount, hotel.guest_rating.score);
}
```

`2621` is New York City. Pass `page.pagination.next_cursor` as `cursor`, with the same inputs, for the next 25; each page costs 4 credits.

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

## Plan around a stay

```ts
const calendar = await tapline.expedia.getHotelCalendar({ hotel_id: '105590218' });
const bookable = calendar.days.filter((day) => day.check_in_status === 'valid');
console.log(bookable[0]?.date, bookable[0]?.price?.formatted, bookable[0]?.max_nights);

const nearby = await tapline.expedia.listHotelActivities({
  hotel_id: '19681371',
  start_date: '2026-12-14',
  end_date: '2026-12-16',
});
for (const activity of nearby.activities) {
  console.log(activity.name, activity.distance, activity.price?.current.formatted);
}
```

## Search a round trip

```ts
const outbound = await tapline.expedia.searchFlights({
  origin: 'JFK',
  destination: 'CDG',
  departure_date: '2026-12-14',
  return_date: '2026-12-21',
  max_stops: 0,
});
const [flight] = outbound.flights;
const fare = flight?.fares[0];
if (flight && fare?.next_leg_token) {
  console.log(flight.segments[0]?.flight_number, flight.departure.local_time, fare.name, fare.total_price?.formatted);
  const returns = await tapline.expedia.searchNextLeg({ token: fare.next_leg_token });
  for (const back of returns.flights) {
    console.log(back.segments[0]?.flight_number, back.price?.formatted, back.price_difference?.formatted);
  }
}
```

Use a token soon after the search.

## Read the response

- `price.total` is the whole stay with taxes and fees, as an exact amount. `price.nightly` is Expedia's displayed nightly rate before taxes, rounded to whole dollars.
- `price` is `null` on a search card when Expedia shows no bookable rate for your dates or party.
- Search cards carry coordinates but no star rating; `getHotel` has it.
- `subtitles` on a search card are Expedia's heading lines as shown: a neighborhood for hotels, "Entire home by Vrbo" for many vacation homes.
- `total_count` is Expedia's own estimate and can move when you add filters.
- `strikethrough` is the whole stay's earlier total, comparable with `total`, not with `nightly`.
- An empty `cancellation_policy` means the plan is non-refundable. `extras` names what a plan adds, such as `Breakfast` or `No extras`.
- No rooms means the dates aren't bookable; `getHotelCalendar` shows which dates are. A room Expedia cannot sell for your party comes back with empty `rate_plans`.
- `price_insight` needs the hotel's `region_id` (from `getHotel`) and is still `null` for some stays.
- On a calendar, `has_daily_availability` is `true` for vacation homes, which report each day's `available`, statuses and night limits. Hotel calendars carry prices only. The stay dates move the window only when they lie past the default range.
- `traveler_types` are Expedia's labels, such as `Traveled with partner`.
- `distance` is filled only by `listHotelActivities`. Activity scores use the same 10-point scale as hotels.

Flights:

- `price` is Expedia's per-traveler price for the whole trip, rounded to whole dollars; with children or lap infants it is the adult price. `total_price` on a fare is the exact total for every traveler.
- On a later leg each flight carries `price_difference` (`+$7`) against the cheapest choice. Its fares keep their name, cabin and features, with `price` null and `price_difference` and `total_price` set.
- `flights` holds only flights that match every filter. An empty list means none do, or Expedia has no flights for that day or airport.
- `local_time` is the airport's local time; `timezone` is the abbreviation Expedia shows. `segments[].cabin` is exact per segment; a fare's `cabin` can read "First Class from JFK to RDU. Business from RDU to LHR."
- `next_leg_token` is set only when the trip has another leg.
- The fare calendar lists only dates Expedia has a recent price for. Premium cabins have no calendar: `dates` is empty and `prediction` is often null.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors (past or over-long dates, an unknown enum value, a minimum price above its maximum, a cursor this API did not issue) are not charged. An expired or malformed `next_leg_token` answers 400 `invalid_cursor` and is not charged. An unknown hotel answers 404 on every hotel method, and an unknown activity on `getActivity`; both are charged. Blocks and upstream failures answer 503 and are not charged.

The [Expedia API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=expedia_readme#/expedia) lists the inputs, response fields, and credit cost for each method.
