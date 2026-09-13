# YouTube with the Tapline TypeScript SDK

Use the YouTube client to get transcripts, search videos, inspect channels and playlists, and collect comments.

[Package guide](../../../README.md) · [YouTube API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=youtube_readme#/youtube)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=youtube_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=youtube_readme).

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

### Discovery and collections

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `search` | `SearchParams`: `query`; optional `country`, `sort`, `upload_date`, `search_type`, `duration`, `features`, `cursor` | `SearchResponse` with videos, channels, playlists, and movies |
| `getChannel` | `GetChannelParams`: `channel_id` | `ChannelResponse` profile, handle, statistics, and content tabs |
| `getChannelVideos` | `GetChannelVideosParams`: `channel_id`; optional `content_type`, `cursor` | `ChannelVideosResponse` page and next cursor |
| `getPlaylist` | `GetPlaylistParams`: `playlist_id`; optional `limit` | `PlaylistResponse` details and videos |

### Video data

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getMetadata` | `GetMetadataParams`: `video_id`; optional `fields`, `country` | `VideoMetadataResponse` with projected metadata |
| `getFormats` | `GetFormatsParams`: `video_id` | `FormatsResponse` with available audio/video streams |
| `getHeatmap` | `GetHeatmapParams`: `video_id` | `HeatmapResponse` with replay-intensity points, or no heatmap |

### Transcripts and comments

| Method | Parameter type and key fields | Returns |
| --- | --- | --- |
| `getSubtitles` | `GetSubtitlesParams`: `video_id`; optional `language`, `subtitle_format`, `source`, `country` | `SubtitleResponse` in SRT, VTT, JSON3, TTML, or plain text |
| `getSubtitleTracks` | `GetSubtitleTracksParams`: `video_id`; optional `country` | `SubtitleTracksResponse` with manual and automatic tracks |
| `getComments` | `GetCommentsParams`: `video_id`; optional `sort`, `cursor` | `CommentsResponse` page of top-level threads |
| `getCommentReplies` | `GetCommentRepliesParams`: `video_id`, `comment_id`, `cursor` | `RepliesResponse` page and next cursor |

## Get a transcript

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const tracks = await tapline.youtube.getSubtitleTracks({ video_id: 'jNQXAC9IVRw' });
const transcript = await tapline.youtube.getSubtitles({
  video_id: 'jNQXAC9IVRw',
  language: 'en',
  subtitle_format: 'txt',
});

console.log([...tracks.manual, ...tracks.auto].map((track) => track.language));
console.log(transcript.transcript);
```

`source: 'any'` prefers a manual track and falls back to automatic captions. Use `srt`, `vtt`, `json3`, or `ttml` when timing or styling matters.

## Search videos and channels

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const results = await tapline.youtube.search({
  query: 'learn TypeScript',
  sort: 'view_count',
});
const metadata = await tapline.youtube.getMetadata({
  video_id: 'dQw4w9WgXcQ',
  fields: 'title,channel,view_count',
});
const channel = await tapline.youtube.getChannel({ channel_id: '@Computerphile2' });
const videos = await tapline.youtube.getChannelVideos({ channel_id: '@Computerphile2' });

console.log(results.results.map((item) => item.title));
console.log(metadata.title, metadata.view_count);
console.log(channel.channel, channel.channel_follower_count);
console.log(videos.videos.map((video) => video.title));
```

## Get comments

```ts
import { TaplineClient } from '@tapline/client';

const tapline = new TaplineClient();
const comments = await tapline.youtube.getComments({
  video_id: 'dQw4w9WgXcQ',
  sort: 'new',
});

for (const thread of comments.threads) {
  console.log(thread.comment.text);
}
```

To fetch replies, pass a thread's non-null `replies_cursor` together with its `comment_id` to `getCommentReplies`. Cursors are tied to the original resource and can expire.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). The [YouTube API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=youtube_readme#/youtube) lists the inputs, response fields, limits, and credit cost for each method.
