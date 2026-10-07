# Pinterest with the Tapline TypeScript SDK

Use the Pinterest client to read public Pinterest data as pinterest.com shows it to logged-out visitors: pin search, one pin with every image size, its video and idea-pin pages, a user's boards, and the pins on a board. No Pinterest account is needed.

[Package guide](../../../README.md) · [Pinterest API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_readme#/pinterest)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_readme).

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

| Method | Key inputs | Credits | Returns |
| --- | --- | --- | --- |
| `searchPins` | `query`, `cursor` | 1 | `PinterestSearchResponse`: `pins` (Pinterest's search result objects plus an absolute `url`) and `cursor` |
| `getPin` | `url`: a pin URL on any Pinterest domain, or a `pin.it` share link | 1 | `PinterestPinResponse`: the pin's GraphQL object in camelCase (`entityId`, `title`, `pinner`, `board`, `images_<size>` and `imageSpec_<size>`, `videos`, `storyPinData`, `aggregatedPinData`) |
| `getUserBoards` | `handle`, `cursor` | 1 | `PinterestUserBoardsResponse`: `boards` (name, relative `url`, counts, owner, cover images) and `cursor` |
| `getBoard` | `url`: a board URL, or the relative `url` from `getUserBoards`; `cursor` | 1 | `PinterestBoardResponse`: `pins` in board order and `cursor` |

Each body is Pinterest's own data in the layout Scrape Creators returns, with `success`, `credits_charged` and `credits_remaining` at the top level. `trim` and `cache_max_age` are accepted for Scrape Creators compatibility and change nothing: every call returns the full body and is charged.

## Search pins and page through the results

```ts
let cursor: string | null | undefined;
do {
  const page = await tapline.pinterest.searchPins({ query: 'italian pot roast', cursor: cursor ?? undefined });
  for (const pin of page.pins) {
    console.log(pin.id, pin.url, pin.title, pin.pinner?.username, pin.images?.orig?.url);
  }
  cursor = page.cursor;
} while (cursor);
```

Pinterest sends up to 25 pins per page and the count varies, so keep paging while `cursor` is not `null`. A pin can show up on two pages. Most queries return related pins even without an exact match, but a query with no matches returns an empty first page, and that call is charged. Pinterest leaves keys out when a pin has nothing for them, so most pin fields are optional: a pin uploaded without a link has no `link` key.

## Read a pin

```ts
const pin = await tapline.pinterest.getPin({ url: 'https://pin.it/2u9bHtUx6' });

console.log(pin.entityId, pin.title, pin.link, pin.pinner?.username, pin.imageSpec_orig?.url);
console.log(pin.aggregatedPinData?.aggregatedStats?.saves, pin.repinCount, pin.createdAt);
const video = pin.videos?.videoList.v720P?.url ?? pin.videos?.videoList.vHLSV4?.url;
if (video) {
  console.log('video', video, pin.videos?.duration);
}
for (const page of pin.storyPinData?.pages ?? []) {
  console.log('idea pin page', page.blocks?.length);
}
```

`entityId` is the numeric pin id; `id` is Pinterest's base64 node id, so join pins from `getPin` with search or board pins on `entityId`. Pinterest's `isVideo` is `false` on some video pins, so test `videos` instead. A `pin.it` link is followed to its pin before the lookup, at no extra charge.

## List a user's boards, then read one

```ts
const boards = await tapline.pinterest.getUserBoards({ handle: 'broadstbullycom' });
for (const board of boards.boards) {
  console.log(board.name, board.url, board.pin_count, board.follower_count);
}
const first = boards.boards[0];
if (first?.url) {
  const page = await tapline.pinterest.getBoard({ url: first.url });
  for (const pin of page.pins) {
    console.log(pin.id, pin.title, pin.link ?? 'uploaded, no link', pin.images?.orig?.url);
  }
}
```

Boards come most recently pinned to first, up to 25 per page. A board's `url` is relative (`/broadstbullycom/nhl-hockey/`) and `getBoard` takes it as it is. Board pins carry `link: null` when the pin was uploaded without one, and Pinterest sends no `pin_join` for them.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md).

- A pin, user or board Pinterest does not have throws with status 404 and code `not_found`. So does a `pin.it` link that leads to a board or nowhere. The call is charged.
- A cursor Pinterest does not recognise throws with status 400 and code `invalid_cursor`, and is not charged.
- A malformed URL or handle, a Pinterest page name such as `search` used as a handle, or a profile tab such as `/_created/` used as a board throws with status 422 before any fetch, and is not charged.
- Upstream failures throw with status 503 and are not charged.

Every response reports `credits_charged` and `credits_remaining`, your balance after the call. The [Pinterest API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_readme#/pinterest) lists every field.
