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
| `getUserProfile` | `screen_name` (handle without `@`) | 1 | `TwitterProfileResponse`: X's User object (`rest_id`, `core`, `legacy`, `location`, `privacy`, `verification`) plus `pinned_tweet` and `tweets` (the 4 or 5 newest original posts) |
| `getUserProfileById` | `user_id` | 1 | the same `TwitterProfileResponse` |
| `getTweet` | `tweet_id` | 1 | `TwitterTweetDetailResponse`: X's Tweet object (`rest_id`, `core`, `legacy`, `views`, `note_tweet`, `quoted_status_result`) plus `parent_tweets` and `replies` (the top replies x.com shows logged-out) |
| `getCommunity` | `community_id` | 2 | `TwitterCommunityResponse`: X's Community object (`rest_id`, `name`, `member_count`, `rules`, `creator_results`) plus `tweets` (the 20 posts x.com ranks by likes) |

Each body is X's own object in the layout Scrape Creators returns, with `success`, `credits_charged` and `credits_remaining` at the top level. Each call returns a fixed window. x.com offers no further pages to logged-out visitors, so there is no cursor.

## Read a profile

```ts
const profile = await tapline.twitter.getUserProfile({ screen_name: 'nasa' });

console.log(profile.rest_id, profile.core.name, profile.core.created_at, profile.is_blue_verified);
console.log(profile.legacy.followers_count, profile.legacy.statuses_count, profile.location.location);
for (const tweet of profile.tweets) {
  console.log(tweet.url, tweet.legacy.created_at, tweet.legacy.favorite_count, tweet.views.count);
}
```

A protected account returns its profile with `privacy.protected` set and no posts.

## Read a post

```ts
const post = await tapline.twitter.getTweet({ tweet_id: '2106870968048386134' });

const text = post.note_tweet?.note_tweet_results.result.text ?? post.legacy.full_text;
const links = Object.fromEntries((post.legacy.entities.urls ?? []).map((url) => [url.url, url.expanded_url]));
for (const media of post.legacy.extended_entities?.media ?? []) {
  const best = (media.video_info?.variants ?? [])
    .filter((variant) => variant.bitrate !== undefined)
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
  console.log(media.type, media.media_url_https, best?.url);
}
const quoted = post.quoted_status_result?.result;
if (quoted) {
  console.log('quotes', quoted.rest_id, quoted.core.user_results.result.core.screen_name);
}
```

`legacy.full_text` keeps X's `t.co` links and HTML escapes, and holds X's shortened text for a long post; `note_tweet` carries the full text. `legacy.entities.urls` maps each `t.co` link to its expanded URL. `parent_tweets` holds the post a reply answers. Follow `legacy.in_reply_to_status_id_str` to walk further up. The author under `core.user_results.result` carries only what x.com embeds with posts, plus the join date (`core.created_at`) that Tapline adds. Call `getUserProfile` for the location, banner and bio link.

## Read a community

```ts
const community = await tapline.twitter.getCommunity({ community_id: '1493446837214187523' });

const creator = community.creator_results?.result;
console.log(community.name, community.member_count, creator && 'id' in creator ? creator.core?.screen_name : undefined);
for (const tweet of community.tweets) {
  console.log(tweet.user.core.screen_name, tweet.favorite_count, tweet.view_count, tweet.full_text.slice(0, 80));
}
```

Community posts come flattened the way Scrape Creators flattens them: a post's `legacy` fields sit at the top level next to `id`, `view_count` and the author as `user`. The community's `created_at` is in Unix milliseconds. x.com sends a suspended or deactivated member as a bare `UserUnavailable`, so `creator_results.result` and each `members_facepile_results[].result` is either a `TwitterCommunityUser` or a `TwitterUnavailableResult`. Check for `id` before reading profile fields.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md).

- An account, post, or community x.com does not show throws with status 404 and code `not_found`. x.com answers the same way for deleted accounts and for live accounts it hides from logged-out visitors. The call is charged.
- A suspended account throws with status 403 and code `resource_forbidden` when looked up by handle, and 404 when looked up by id. A post x.com withholds from logged-out visitors, such as one by a protected author, also throws 403. The call is charged.
- A malformed handle or id, or one of x.com's own page names such as `explore`, throws with status 422 before any fetch, and is not charged.
- Upstream failures and x.com's login wall throw with a 5xx status and are not charged.

Every response reports `credits_charged` and `credits_remaining`, your balance after the call. The [Twitter API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=twitter_readme#/twitter) lists every field.
