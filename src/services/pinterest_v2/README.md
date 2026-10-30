# Pinterest v2 with the Tapline TypeScript SDK

Use the Pinterest v2 client to read public Pinterest data as pinterest.com shows it to logged-out visitors: pin search, one pin, a user's boards, and the pins on a board. Every method returns the same pin, board and user objects, so code that reads a search pin also reads a board pin. No Pinterest account is needed.

The [Pinterest v1 client](../pinterest/README.md) reads the same four pages at the same prices in Pinterest's own layout. Both stay available.

[Package guide](../../../README.md) · [Pinterest API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_v2_readme#/pinterest)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_v2_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=pinterest_v2_readme).

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
| `searchPins` | `query`, `cursor` | 1 | `PinterestV2SearchResponse`: `pins`, the refinement `guides` Pinterest suggests, and `cursor` |
| `getPin` | `url`: a pin URL on any Pinterest domain, or a `pin.it` share link | 1 | `PinterestV2PinResponse`: one pin with its people, board, metrics, images, video and idea-pin pages |
| `getUserBoards` | `handle`, `cursor` | 1 | `PinterestV2UserBoardsResponse`: `boards` and `cursor` |
| `getBoard` | `url`: a board URL, such as a board's `url` from `getUserBoards`; `cursor` | 1 | `PinterestV2BoardResponse`: the `board` itself, `pins` in board order and `cursor` |

`trim` is accepted on every method and `cache_max_age` on `getPin`. Neither changes the response, and every successful call is charged.

## Search pins and page through the results

```ts
let cursor: string | null | undefined;
do {
  const page = await tapline.pinterestV2.searchPins({ query: 'italian pot roast', cursor: cursor ?? undefined });
  for (const pin of page.pins) {
    const original = pin.images?.find((image) => image.variant === 'orig');
    console.log(pin.id, pin.url, pin.title, pin.pinner?.username, original?.url);
  }
  cursor = page.cursor;
} while (cursor);
```

Pinterest sends up to 25 pins per page and the count varies, so keep paging while `cursor` is not `null`. A pin can show up on two pages. A query with no matches returns an empty first page, and that call is charged. `images` lists every size Pinterest has for the pin, each with its `variant` (`236x`, `736x`, `orig`) and, where Pinterest sends them, `width` and `height`.

## Read a pin

```ts
const pin = await tapline.pinterestV2.getPin({ url: 'https://pin.it/2u9bHtUx6' });

console.log(pin.id, pin.title, pin.link, pin.media_type, pin.created_at);
console.log(pin.pinner?.username, pin.creator?.username, pin.board?.name, pin.board?.url);
console.log(pin.metrics?.save_count, pin.metrics?.repin_count, pin.metrics?.reaction_count, pin.hashtags);
const stream = pin.video?.variants?.find((variant) => variant.variant === 'v720P') ?? pin.video?.variants?.[0];
if (stream) {
  console.log('video', stream.url, pin.video?.duration_ms);
}
for (const storyPage of pin.story?.pages ?? []) {
  console.log('idea pin page', storyPage.id, storyPage.blocks?.length);
}
```

`id` is the numeric pin id that search and board pins carry too, and `node_id` is Pinterest's base64 node id. People keep their roles: `pinner` saved the pin, `creator` made it, and `origin_pinner`, `promoter` and `link_owner` appear when Pinterest names them. `created_at` is Pinterest's own date text (`Sun, 06 Apr 2025 06:52:37 +0000`). Pinterest leaves keys out when a pin has nothing for them, so every field is optional. A `pin.it` link is followed to its pin before the lookup, at no extra charge.

## List a user's boards, then read one

```ts
const boards = await tapline.pinterestV2.getUserBoards({ handle: 'broadstbullycom' });
for (const board of boards.boards) {
  console.log(board.name, board.url, board.pin_count, board.follower_count, board.owner?.username);
}
const first = boards.boards[0];
if (first?.url) {
  const page = await tapline.pinterestV2.getBoard({ url: first.url });
  console.log(page.board.name, page.board.pin_count, page.board.category);
  for (const pin of page.pins) {
    console.log(pin.id, pin.title, pin.link ?? 'uploaded, no link', pin.metrics?.save_count);
  }
}
```

Boards come most recently pinned to first, about 25 per page. A board's `url` is absolute and `getBoard` takes it as it is. `getBoard` also returns the board itself as `board`, the same object `getUserBoards` lists, plus `category`, `sectionless_pin_count` and `header_images` when Pinterest has them. Tapline keeps a board's details for up to 24 hours, so its counts can be that old; the pins are fetched on every call. A pin uploaded without a link has no `link`.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md).

- A pin, user or board Pinterest does not have throws with status 404 and code `not_found`. So does a `pin.it` link that leads to a board or nowhere. The call is charged.
- A cursor Pinterest does not recognise throws with status 400 and code `invalid_cursor`, and is not charged.
- A malformed URL or handle throws with status 422 before any fetch, and is not charged. So do the `e1_…` ids in search and board results, which Pinterest does not resolve for logged-out visitors.
- Upstream failures throw with status 503 and are not charged.
