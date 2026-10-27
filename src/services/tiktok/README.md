# TikTok with the Tapline TypeScript SDK

Use the TikTok client to read public profiles, videos, comments, followers, sounds, hashtags, collections, captions, search suggestions, and regional trending feeds. No TikTok account is needed.

[Package guide](../../../README.md) · [TikTok API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=tiktok_readme#/tiktok)

## Get started

```sh
npm install @tapline/client
export TAPLINE_API_KEY="your-api-key"
```

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const profile = await tapline.tiktok.getProfile({ handle: 'stoolpresidente' });
console.log(profile.user.uniqueId, profile.statsV2.followerCount);
```

## Common calls

```ts
const post = 'https://www.tiktok.com/@stoolpresidente/video/7517114944362499342';

const video = await tapline.tiktok.getVideo({ url: post });
console.log(video.aweme_detail.statistics.play_count);

const comments = await tapline.tiktok.getComments({ url: post });
const transcript = await tapline.tiktok.getTranscript({ url: post, language: 'en' });
const trending = await tapline.tiktok.getTrendingFeed({ region: 'US' });
```

`getVideo`, `getTrendingFeed`, `getProfileVideos`, `getComments`, `getFollowers`, `getFollowing`, and `searchHashtag` accept `trim: true` for the smaller Scrape Creators-compatible provider-data branch. Tapline omits Scrape Creators' top-level status and credit metadata. Use each response's `cursor`, `max_cursor`, or `min_time` in the next call while `has_more` is true. JavaScript integers that cannot be represented exactly arrive as strings.

Every method costs one credit. Missing or private targets return typed 404 or 403 errors and are charged; invalid input is rejected before charging; temporary upstream failures return 503 and are refunded. A transcript can return 404 when TikTok has no captions for that video.
