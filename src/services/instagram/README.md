# Instagram with the Tapline TypeScript SDK

Use the Instagram client to read public profiles, posts, reels, comments, highlights, audio pages, popular topics, profile embeds, and exact post counts. Profiles, posts and `pagination` have the same shape on every route that returns them. Ids are strings, timestamps are ISO 8601, and durations are in seconds.

[Package guide](../../../README.md) · [Instagram API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=instagram_readme#/instagram)

## Get started

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const { profile } = await tapline.instagram.getProfile({ handle: 'nike' });

console.log(profile.handle, profile.follower_count);
```

The client reads `TAPLINE_API_KEY` in Node.js. You can also pass `apiKey` when constructing `TaplineClient`.

## Endpoints

| Method | Main inputs | Credits |
| --- | --- | --- |
| `getProfile` | `handle` | 3 |
| `getBasicProfile` | `userId` | 1 |
| `getPostCount` | `handle` | 1 |
| `getPost` | `url`, `region`, `include_play_count` | 1 |
| `getPostComments` | `url`, `cursor` | 1 |
| `getUserPosts` | `handle`, `next_max_id` | 3 |
| `getUserReels` | `handle` or `user_id`, `max_id` | 2 |
| `getHighlights` | `handle` or `user_id` | 1 |
| `getHighlightDetail` | `id` | 1 |
| `getAudioReels` | `audio_id`, `cursor` | 1 |
| `searchPopular` | `query`, `cursor` | 3 |
| `getEmbed` | `handle` | 1 |

`getProfile` also returns the first page of recent posts, and `recent_posts_status` says whether that timeline is available, private, or unavailable. `getProfile`, `getPost`, `getUserPosts` and `getUserReels` accept `trim`, which removes nothing.

## Read a post and comments

```ts
const url = 'https://www.instagram.com/reel/Dd9Etk7R91I/';
const { post } = await tapline.instagram.getPost({ url });
const { comments } = await tapline.instagram.getPostComments({ url });

console.log(post.shortcode, post.taken_at, post.metrics.like_count);
for (const comment of comments) {
  console.log(comment.created_at, comment.text);
}
```

`include_play_count: false` skips the extra lookup that fills a video's play count. `region` selects a two-letter exit country and defaults to the US. `download_media` is accepted only as `false`. Tapline returns Instagram's media URLs and does not re-host files.

## Paginate posts and reels

```ts
const first = await tapline.instagram.getUserPosts({ handle: 'nike' });
if (first.pagination.has_more) {
  const second = await tapline.instagram.getUserPosts({
    handle: 'nike',
    next_max_id: first.pagination.next_cursor,
  });
  console.log(second.posts.length);
}

const reels = await tapline.instagram.getUserReels({ handle: 'nike' });
if (reels.pagination.has_more) {
  await tapline.instagram.getUserReels({
    handle: 'nike',
    max_id: reels.pagination.next_cursor,
  });
}
```

Pass `pagination.next_cursor` as `next_max_id` to `getUserPosts`, as `max_id` to `getUserReels`, and as `cursor` to `getPostComments`, `getAudioReels` and `searchPopular`. The `recent_posts.pagination.next_cursor` from `getProfile` also works as `next_max_id`. Pass the cursor back unchanged. Invalid cursors fail before charging.

## Availability and errors

Upstream failures return 503 without charging. Invalid input returns 400 or 422 before a fetch; missing public resources return 404.

See the [package guide](../../../README.md#handle-errors) for typed error handling.
