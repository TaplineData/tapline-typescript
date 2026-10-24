# Indeed with the Tapline TypeScript SDK

Use the Indeed client to read job postings, companies and reported pay from Indeed's 62 country sites.

[Package guide](../../../README.md) · [Indeed API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=indeed_readme#/indeed)

## Get started

[Create a Tapline account](https://tapline.sh/sign-up?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=indeed_readme) and create an API key on the [API keys page](https://tapline.sh/dashboard?tab=api-keys&utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=indeed_readme).

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

Every method except `getSalaries` takes `country`, the Indeed site to read (`us` by default, `gb` for the UK).

| Method | Key inputs | Returns | Credits |
| --- | --- | --- | --- |
| `searchJobs` | `query`, `location`, the filters, `cursor` | up to 25 jobs per page, each with its full record, plus the total and facets | 7 |
| `getJob` | `job_key` | one job: HTML description, pay, company, location, attributes, apply details and applicant count | 1 |
| `listCompanyJobs` | `company_key`, the filters, `cursor` | up to 25 of a company's jobs per page | 7 |
| `getCompany` | `company_key` | profile, employee ratings, happiness scores, CEO approval, average pay and similar companies | 1 |
| `searchCompanies` | `query` | companies matching a name, with their keys | 1 |
| `listCompanyDirectory` | `query`, `location` | companies by name, industry or the titles they hire for, with ratings | 1 |
| `getSalaries` | `location`, `job_title`, `company_key` | average reported pay per year, month, week, day and hour | 1 |
| `listJobTitleSuggestions` | `query` | job searches for partly typed text | 1 |
| `listLocationSuggestions` | `query` | places for partly typed text | 1 |
| `listPopularSearches` | | the searches run most on a country site | 1 |

Paged methods cost their credits per page.

## Search jobs and page through them

```ts
let cursor = '';
while (true) {
  const page = await tapline.indeed.searchJobs({
    query: 'registered nurse',
    location: 'Houston, TX',
    job_type: ['full_time'],
    posted_within_days: 7,
    cursor,
  });
  for (const { job } of page.results) {
    console.log(job.key, job.title, job.company_name_as_posted, job.pay?.text);
  }
  if (!page.pagination.next_cursor) break;
  cursor = page.pagination.next_cursor;
}
```

Send the same search and `limit` with every cursor. `job_type`, `work_setting` and `experience_level` keep jobs matching any of the values you pass; `attribute` and `occupation` keep jobs carrying every code. The `exclude_` filters drop jobs, and keeping and excluding the same value answers 422.

## Read a company and its jobs

```ts
const { companies } = await tapline.indeed.searchCompanies({ query: 'google' });
const company = await tapline.indeed.getCompany({ company_key: companies[0].key });
console.log(company.name, company.ratings.overall, company.ceo.approval);

const jobs = await tapline.indeed.listCompanyJobs({ company_key: company.key, query: 'engineer', limit: 10 });
for (const { job } of jobs.results) console.log(job.title, job.location?.label);
```

A job's `company.key` works here too.

## Look up pay

```ts
const pay = await tapline.indeed.getSalaries({ location: 'US/TX/Austin', job_title: 'registered nurse' });
console.log(pay.reported_pay.report_count, pay.reported_pay.year?.mean);
```

`location` is Indeed's path: `US`, `US/TX` or `US/TX/Austin`. `listLocationSuggestions` returns it as `salary_location` for US cities.

## Read the response

- `job.key` is what `getJob` takes, the same as `jk` in an Indeed viewjob URL. Pass `getJob` the `country` you searched with: Indeed sends a job's pay only on the site that listed it.
- `pay.text` is the pay as the posting shows it and `pay.posted` the parsed range, exact amount or bound. `pay.estimated` is Indeed's own estimate when the posting has no pay.
- `company` is `null` when Indeed links no company page to the job; `company_name_as_posted` is the name the posting shows.
- `attributes` groups Indeed's codes by kind (job types, work settings, schedules, benefits, education and more). Each `code` works in the `attribute` and `exclude_attribute` filters.
- `applicants` is filled by `getJob`. In search results it is `null`.
- `total.is_estimate` says whether `total.count` is Indeed's estimate. `facets.companies` carries company keys and counts only; Indeed sends no names there.
- `sort: 'date'` favours recent postings, but Indeed does not order a page strictly by date. Use `posted_within_days` for a cut-off.
- A rating with no reviews is `null`, not zero, and so are happiness scores and CEO approval with no votes.

## Handle errors and check costs

Failed calls throw the errors described in the [package guide](../../../README.md#handle-errors). Validation errors are not charged: an unknown enum value, a kept and excluded filter, a `language` the country site does not offer, a malformed salary location, or a cursor from another search or `limit`. A company key Indeed cannot read answers 400 `invalid_request` on `listCompanyJobs`, `searchJobs` (`exclude_company`) and `getSalaries`, and is not charged. An unknown job or company answers 404 on `getJob` and `getCompany`, and is charged.

The [Indeed API reference](https://tapline.sh/docs?utm_source=typescript_client&utm_medium=referral&utm_campaign=developer_acquisition&utm_content=indeed_readme#/indeed) lists the inputs, response fields, and credit cost for each method.
