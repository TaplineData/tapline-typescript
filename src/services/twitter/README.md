# Twitter (X) with the Tapline TypeScript SDK

Use the Twitter client to read public X data as x.com shows it to logged-out visitors: a profile by handle or numeric id, an account's pinned and newest posts, one post with its media and quote, and an X Community with its top posts. No X account is needed.

[Package guide](../../../README.md) · [Twitter API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=twitter_readme#/twitter)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=twitter_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=twitter_readme).

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
| `getProfile` | `handle` (with or without `@`) or `user_id` | 1 | `TwitterProfileResponse`: the account, with the same fields as a post's `author` |
| `getUserTweets` | `handle` | 1 | `TwitterUserTweetsResponse`: `tweets`, the pinned post then the newest original posts, 5 in all in samples |
| `getTweet` | `url` (a post URL) | 1 | `TwitterTweetResponse`: one post with its `author`, `media` and `quoted_post` |
| `getCommunity` | `url` (a community URL) | 1 | `TwitterCommunityResponse`: the community with its `rules`, `creator` and a preview of `members` |
| `getCommunityTweets` | `url` (a community URL) | 1 | `TwitterCommunityTweetsResponse`: `tweets`, the 20 posts x.com ranks by likes |

Every post has the same fields on all three post methods. `id` is X's numeric id, and every timestamp is ISO 8601 UTC, such as `2026-10-04T22:15:57Z`. Each call returns a fixed window. x.com offers no further pages to logged-out visitors, so there is no cursor.

## Read a profile

```ts
const profile = await tapline.twitter.getProfile({ handle: 'nasa' });

console.log(profile.id, profile.name, profile.created_at, profile.is_blue_verified);
console.log(profile.follower_count, profile.post_count, profile.location);
```

Send `handle` or `user_id`, not both. `user_id` is the account's numeric `id`, and it still finds the account after a handle change:

```ts
const sameAccount = await tapline.twitter.getProfile({ user_id: profile.id });
```

## Read an account's posts

```ts
const { tweets } = await tapline.twitter.getUserTweets({ handle: 'nasa' });

for (const tweet of tweets) {
  console.log(tweet.url, tweet.created_at, tweet.favorite_count, tweet.view_count);
}
```

`tweets` starts with the pinned post, if there is one, and marks it with `is_pinned`. A protected account returns no posts.

## Read a post

```ts
const post = await tapline.twitter.getTweet({ url: 'https://x.com/Seahawks/status/2106870968048386134' });

console.log(post.author.handle, post.created_at, post.text);
const links = Object.fromEntries((post.entities.urls ?? []).map((url) => [url.url, url.expanded_url]));
for (const media of post.media ?? []) {
  const best = (media.variants ?? [])
    .filter((variant) => variant.bitrate !== undefined)
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
  console.log(media.type, media.media_url, best?.url);
}
if (post.quoted_post) {
  console.log('quotes', post.quoted_post.id, post.quoted_post.post?.author.handle);
}
```

`url` takes a post URL on x.com or twitter.com, including `/i/status/<id>` and URLs with trailing segments such as `/photo/1`. `text` decodes X's HTML escapes, keeps its `t.co` links, and holds the full text of a long post. A long post also carries `preview_text`, the shortened version x.com shows first. `entities.urls` maps each `t.co` link to its expanded URL. Follow `reply_to.post_id` to the post a reply answers. The `author` also carries what x.com shows only on profile pages, such as `location`, the join date, the bio, the bio link and the banner. Tapline reads these from the author's profile page at no extra charge, so they can be up to 2 minutes old. It is best-effort, and an author whose profile page fails or is slow keeps only what x.com embeds with posts.

## Read a community

```ts
const url = 'https://x.com/i/communities/1493446837214187523';
const community = await tapline.twitter.getCommunity({ url });

const { creator } = community;
console.log(community.name, community.member_count, creator && !('is_unavailable' in creator) ? creator.handle : undefined);

const { tweets } = await tapline.twitter.getCommunityTweets({ url });
for (const tweet of tweets) {
  console.log(tweet.author.handle, tweet.favorite_count, tweet.view_count, tweet.text.slice(0, 80));
}
```

Tapline returns a suspended or deactivated member as only its `id` and `is_unavailable: true`, so `creator` and each entry in `members` is either a `TwitterUser` or a `TwitterUnavailableUser`. Check for `is_unavailable` before reading profile fields.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md).

- An account, post, or community x.com does not show throws with status 404 and code `not_found`. x.com answers the same way for deleted accounts and for live accounts it hides from logged-out visitors. The call is charged.
- A suspended account throws with status 403 and code `resource_forbidden` when looked up by handle, and 404 when looked up by id. A post x.com withholds from logged-out visitors, such as one by a protected author, also throws 403. The call is charged.
- A malformed handle, id or URL, one of x.com's own page names such as `explore`, or a `getProfile` call with both or neither of `handle` and `user_id` throws with status 422 before any fetch, and is not charged.
- Upstream failures and x.com's login wall throw with status 503 and are not charged.

The [Twitter API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=twitter_readme#/twitter) lists every response field.
