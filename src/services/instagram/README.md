# Instagram with the Tapline TypeScript SDK

Use the Instagram client to read public profiles, posts, reels, comments, highlights, audio pages, popular topics, profile embeds, and exact post counts. Responses follow Scrape Creators' Instagram contracts so an existing integration can migrate by changing its client and base URL.

[Package guide](../../../README.md) · [Instagram API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=instagram_readme#/instagram)

## Get started

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const profile = await tapline.instagram.getProfile({ handle: 'nike' });

console.log(profile.data.user.username, profile.data.user.edge_followed_by.count);
```

The client reads `TAPLINE_API_KEY` in Node.js. You can also pass `apiKey` when constructing `TaplineClient`.

## Endpoints

| Method | Main inputs | Credits |
| --- | --- | --- |
| `getProfile` | `handle`, `trim` | 1 |
| `getBasicProfile` | `userId` | 1 |
| `getPostCount` | `handle` | 1 |
| `getPost` | `url`, `region`, `include_play_count`, `trim` | 2 |
| `getPostComments` | `url`, `cursor` | 1 |
| `getUserPosts` | `handle`, `next_max_id`, `trim` | 1 |
| `getUserReels` | `handle` or `user_id`, `max_id`, `trim` | 1 |
| `getHighlights` | `handle` or `user_id` | 1 |
| `getHighlightDetail` | `id` | 1 |
| `getAudioReels` | `audio_id`, `cursor` | 1 |
| `searchPopular` | `query`, `cursor` | 2 |
| `getEmbed` | `handle` | 1 |

## Read a post and comments

```ts
const url = 'https://www.instagram.com/reel/Dd9Etk7R91I/';
const post = await tapline.instagram.getPost({ url });
const comments = await tapline.instagram.getPostComments({ url });

console.log(post.data.xdt_shortcode_media.shortcode);
for (const comment of comments.comments) {
  console.log(comment.user.username, comment.text);
}
```

`include_play_count: false` skips the extra lookup used to enrich video posts. `region` selects a two-letter exit country and defaults to the US. `download_media` is accepted only as `false`; Tapline returns Instagram's media URLs and does not re-host files.

## Paginate posts and reels

```ts
const first = await tapline.instagram.getUserPosts({ handle: 'nike' });
if (first.next_max_id) {
  const second = await tapline.instagram.getUserPosts({
    handle: 'nike',
    next_max_id: first.next_max_id,
  });
  console.log(second.items.length);
}

const reels = await tapline.instagram.getUserReels({ handle: 'nike' });
if (reels.paging_info?.max_id) {
  await tapline.instagram.getUserReels({
    handle: 'nike',
    max_id: reels.paging_info.max_id,
  });
}
```

Pass the returned cursor back unchanged. Invalid cursors fail before charging.

## Availability and errors

Upstream failures return 503 without charging. Invalid input returns 400 or 422 before a fetch; missing public resources return 404.

Tapline omits Scrape Creators' top-level success and credit metadata. See the [package guide](../../../README.md#handle-errors) for typed error handling.
