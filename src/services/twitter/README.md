# Twitter (X) with the Tapline TypeScript SDK

Use the Twitter client to read public X data as x.com shows it to logged-out visitors: a profile with its pinned and newest posts, one post with its media, quote, parent and top replies, and an X Community with its top posts. No X account is needed.

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
| `getUserProfile` | `screen_name` (handle without `@`) | 1 | `TwitterProfileResponse`: `user`, `pinned_tweet`, `tweets` (the 4 or 5 newest original posts) |
| `getUserProfileById` | `user_id` | 1 | the same `TwitterProfileResponse` |
| `getTweet` | `tweet_id` | 1 | `TwitterTweetDetailResponse`: `tweet`, `parent_tweets`, `replies` (the top replies x.com shows logged-out) |
| `getCommunity` | `community_id` | 2 | `TwitterCommunityResponse`: `community`, `tweets` (the 20 posts x.com ranks by likes) |

Each call returns a fixed window. x.com offers no further pages to logged-out visitors, so there is no cursor.

## Read a profile

```ts
const profile = await tapline.twitter.getUserProfile({ screen_name: 'nasa' });

const { user } = profile;
console.log(user.id, user.name, user.followers_count, user.is_blue_verified, user.bio_url);
for (const tweet of profile.tweets) {
  console.log(tweet.created_at, tweet.like_count, tweet.view_count, tweet.text.slice(0, 80));
}
```

A protected account returns its profile with `is_protected` set and no posts.

## Read a post

```ts
const { tweet } = await tapline.twitter.getTweet({ tweet_id: '2106870968048386134' });

const links = Object.fromEntries(tweet.urls.map((url) => [url.url, url.expanded_url]));
for (const media of tweet.media) {
  const best = media.variants.filter((v) => v.bitrate).sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
  console.log(media.type, media.media_url, best?.url);
}
```

`text` keeps X's `t.co` links; `urls` maps each one to its expanded URL, and the trailing media link maps to the media page. `parent_tweets` holds the post a reply answers. Follow `in_reply_to_tweet_id` to walk further up.

## Read a community

```ts
const page = await tapline.twitter.getCommunity({ community_id: '1493446837214187523' });

console.log(page.community.name, page.community.member_count, page.community.creator?.screen_name);
```

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md).

- An account, post, or community x.com does not show throws with status 404 and code `not_found`. x.com answers the same way for deleted accounts and for live accounts it hides from logged-out visitors. The call is charged.
- A suspended account throws with status 403 and code `resource_forbidden`. The call is charged.
- A malformed handle or id, or one of x.com's own page names such as `explore`, throws with status 422 before any fetch, and is not charged.
- Upstream failures and x.com's login wall throw with a 5xx status and are not charged.

The [Twitter API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=twitter_readme#/twitter) lists every field.
