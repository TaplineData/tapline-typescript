# LinkedIn with the Tapline TypeScript SDK

Use the LinkedIn client to read public LinkedIn data as linkedin.com shows it to logged-out visitors: member profiles, company, school and showcase pages and their posts, single posts and Pulse articles, video transcripts, job search and job postings. No LinkedIn account is needed.

[Package guide](../../../README.md) · [LinkedIn API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=linkedin_readme#/linkedin)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=linkedin_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=linkedin_readme).

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
| `getProfile` | `url`: a `/in/<name>` profile URL | 2 | `LinkedinProfileResponse`: name, headline, location, followers, About, `experience` and `education`, articles, recent posts, publications, projects, recommendations, websites, `similarProfiles` |
| `getCompany` | `url`: a `/company/`, `/school/` or `/showcase/` page URL | 1 | `LinkedinCompanyResponse`: id, name, description, location, employee and follower counts, website, industry, size, founding year, specialties, similar and affiliated pages, featured employees, latest posts |
| `getCompanyPosts` | `url`, `page` (1 to 7) | 1 | `LinkedinCompanyPostsResponse`: 10 `posts` per page with text, counts, `author` and `isRepost`, and `hasNextPage` |
| `getPost` | `url`: a `/posts/`, `/feed/update/urn:li:...` or `/pulse/` URL | 1 | `LinkedinPostResponse`: text, publish time, counts, author, comments, images, `video`, and `moreArticles` for an article |
| `getPostTranscript` | `url`: a post with a native video | 1 | `LinkedinPostTranscriptResponse`: the video's captions as plain text |
| `searchJobs` | `keywords`, `location` or `geo_id`, `distance`, `posted_within`, `company_ids`, `easy_apply`, `cursor` | 1 | `LinkedinJobsSearchResponse`: 10 `jobs` per page and `pagination` |
| `getJob` | `url`: a `/jobs/view/<id>/` URL | 1 | `LinkedinJobResponse`: title, company, location, applicants, salary when published, description, seniority, employment type, industries, `easyApply` |

Field names follow Scrape Creators' LinkedIn endpoints where both exist, without their status and credit metadata. Fields LinkedIn leaves out for a page are `null`.

## Read a profile

```ts
const profile = await tapline.linkedin.getProfile({ url: 'https://www.linkedin.com/in/williamhgates/' });

console.log(profile.name, profile.headline, profile.followers);
for (const role of profile.experience) {
  console.log(role.name, role.member.title, role.member.startDate, role.member.endDate);
}
for (const school of profile.education) {
  console.log(school.name, school.member.title);
}
for (const similar of profile.similarProfiles) {
  console.log(similar.name, similar.link);
}
```

Each `experience` and `education` entry is a schema.org organization (`'@type'` is `Organization` or `EducationalOrganization`): `name` is the company or school and `member` is the role, where `title` is the job title or the degree and field. Dates are a year (`2018`) or a month (`'2018-04'`). LinkedIn masks some members' employers with asterisks for guests; those arrive masked with `member.title` set to `null`.

## Read a company and walk its posts

```ts
const url = 'https://www.linkedin.com/company/shopify/';
const company = await tapline.linkedin.getCompany({ url });
console.log(company.id, company.name, company.followers, company.employeeCount, company.industry);

for (let page = 1; ; page += 1) {
  const posts = await tapline.linkedin.getCompanyPosts({ url, page });
  for (const post of posts.posts) {
    console.log(post.datePublished, post.url, post.author.name, post.isRepost ? 'repost' : 'own');
  }
  if (!posts.hasNextPage) break;
}
```

LinkedIn shows guests 7 pages of 10 posts at most. `isRepost` is `true` whenever the post's author is not the page itself, judged against the page LinkedIn serves, so a URL LinkedIn redirects (`/company/stanford-university/` serves the school page) still flags only real reposts.

## Read a post, an article or a video transcript

```ts
const post = await tapline.linkedin.getPost({
  url: 'https://www.linkedin.com/posts/shopify_activity-7511428251756515329-ezTG',
});
console.log(post.datePublished, post.likeCount, post.commentCount, post.description);
if (post.video) {
  console.log('video', post.video.url);
  const transcript = await tapline.linkedin.getPostTranscript({ url: post.url });
  console.log(transcript.transcript);
}
```

A post with no captions throws with status 404 from `getPostTranscript`, and that call is charged.

## Search jobs and page through the results

```ts
const jobIds: string[] = [];
let cursor: string | null | undefined;
do {
  const page = await tapline.linkedin.searchJobs({
    keywords: 'data engineer',
    location: 'New York, United States',
    posted_within: 'past_week',
    cursor,
  });
  for (const card of page.jobs) {
    console.log(card.id, card.title, card.company.name, card.location, card.postedDate);
    jobIds.push(card.id);
  }
  cursor = page.pagination.next_cursor;
} while (cursor && jobIds.length < 30);

const job = await tapline.linkedin.getJob({ url: `https://www.linkedin.com/jobs/view/${jobIds[0]}/` });
console.log(job.title, job.salary, job.easyApply, job.applicants);
```

Each page costs a credit, so stop once you have enough. When a search ends, `pagination.completion` is `exhausted`; LinkedIn's guest search stops at 1,000 results, and a walk that reaches that cap ends with `depth_limit`. Send `location` or `geo_id`: without either, LinkedIn picks the country of the exit it was asked from. Search cards carry no salary; read it from `getJob`, which has it when the employer published a pay range.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md).

- A profile, company, post or job LinkedIn does not have throws with status 404 and code `not_found`. So does a post without captions on `getPostTranscript`. The call is charged.
- A jobs cursor that was not handed out by `searchJobs` throws with status 400 and code `invalid_cursor`, and is not charged.
- A malformed URL, a URL of the wrong kind (a profile URL on `getCompany`), a numeric company URL such as `/company/1035/`, or an out-of-range `page`, `distance` or `geo_id` throws with status 422 before any fetch, and is not charged.
- Upstream failures throw with status 503 and are not charged.

The [LinkedIn API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=linkedin_readme#/linkedin) lists every response field.
