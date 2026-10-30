# Facebook with the Tapline TypeScript SDK

Use the Facebook client to read public pages and profiles, posts, photos, videos, reels and comments, events and public groups. The Ad Library and Marketplace have their own clients: [Facebook Ad Library](../facebook_ad_library/README.md) and [Facebook Marketplace](../facebook_marketplace/README.md).

[Package guide](../../../README.md) · [Facebook API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_readme#/facebook)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_readme).

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
| `resolveUrl` | `url` | the ids a facebook.com URL points to | 3 |
| `lookUpPage` | `username` | the page behind a username | 3 |
| `getPage` | `profile_id` | a page or profile header with its tabs | 3 |
| `getPageIntro` | `profile_id` | the Intro card | 3 |
| `getPageAbout` | `profile_id`, `collection_id` | one About section | 5 |
| `listPagePosts` | `profile_id`, `cursor` | 3 posts per page, newest first | 6 |
| `listPagePhotos` | `profile_id`, `collection_id`, `cursor` | photos, or albums | 3 |
| `listPageVideos` | `page_id`, `cursor` | 9 videos per page | 3 |
| `listPageEvents` | `profile_id`, `collection_id`, `cursor` | upcoming or past events | 3 |
| `listPageFollowers` | `profile_id` | the first followers Facebook shows | 3 |
| `listPageFollowing` | `profile_id`, `collection_id` | the first pages and profiles a page follows | 3 |
| `getPost` | `story_id` | one post with its first comments | 4 |
| `getPhoto` | `photo_id` | one photo with its first comments | 4 |
| `getVideo` | `video_id` | one video with playable URLs and its first comments | 4 |
| `getReel` | `reel_id` | one reel | 3 |
| `listComments` | `feedback_id`, `sort`, `cursor` | comments on a post, photo, video or reel | 3 |
| `listCommentReplies` | `comment_id`, `cursor` | 10 replies per page | 3 |
| `listHashtagPosts` | `hashtag` | the top posts for a hashtag | 3 |
| `searchVideos` | `query`, `cursor` | public videos and reels | 6 |
| `listLiveVideos` |  | live videos Facebook Watch features | 3 |
| `searchEvents` | `query`, `cursor`, `date`, `start_date`, `end_date`, `category_id`, `city_id` | public events | 3 |
| `listCityEvents` | `city_id`, `cursor` | 12 suggested events per page in a city | 3 |
| `getEvent` | `event_id` | an event's header card | 3 |
| `getEventAbout` | `event_id` | an event's About section | 3 |
| `getGroup` | `group_id` | a public group's header | 3 |
| `getGroupAbout` | `group_id` | a public group's About tab | 3 |
| `listGroupPosts` | `group_id`, `sort`, `cursor` | 3 posts per page | 5 |
| `listGroupPhotos` | `group_id`, `cursor` | 8 photos per page | 3 |
| `listGroupEvents` | `group_id` | upcoming and recent past events | 3 |

Paged methods cost their credits per page.

## Turn a URL into ids

```ts
const resolved = await tapline.facebook.resolveUrl({ url: 'https://www.facebook.com/NASA' });
const page = await tapline.facebook.getPage({ profile_id: resolved.ids.profile_id! });
console.log(page.name, page.metrics.follower_count_approx);
for (const tab of page.tabs ?? []) {
  console.log(tab.tab_key, tab.collections.map((collection) => collection.collection_id));
}
```

Pages have two ids. `profile_id` is what the `/pages/{profile_id}` methods take; `page_id` is the id `listPageVideos` and the [Ad Library client](../facebook_ad_library/README.md) take, and `getPage` returns both. A tab's `collection_id` picks an About section, the albums view of photos or the past events.

## Page through posts and comments

```ts
let cursor = '';
do {
  const page = await tapline.facebook.listPagePosts({ profile_id: '100044561550831', cursor });
  for (const post of page.posts) console.log(post.created_at, post.text);
  cursor = page.pagination.next_cursor ?? '';
} while (cursor);

const posts = await tapline.facebook.listPagePosts({ profile_id: '100044561550831' });
const comments = await tapline.facebook.listComments({ feedback_id: posts.posts[0].feedback_id! });
for (const comment of comments.comments) {
  if (comment.id && comment.replies_cursor) {
    const replies = await tapline.facebook.listCommentReplies({
      comment_id: comment.id,
      cursor: comment.replies_cursor,
    });
    console.log(comment.text, replies.replies.length);
  }
}
```

A cursor works only with the method and inputs that issued it.

## Read the response

- Facebook's enum values arrive as `{code, label}`: `code` is Facebook's value and `label` says what it means.
- Pages from `getPage`, `lookUpPage` and the Ad Library share one type. Fields only some of them fill, such as `tabs`, are optional.
- `listPageFollowers`, `listPageFollowing` and `listHashtagPosts` return only the first page Facebook shows; there is no cursor.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors are not charged: `date` with a date range, or a cursor from another method or other inputs. An id Facebook has no public page for answers 404 and is charged. When Facebook refuses every proxy attempt the call answers 503 and is not charged.

The [Facebook API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=facebook_readme#/facebook) lists the inputs, response fields, and credit cost for each method.
