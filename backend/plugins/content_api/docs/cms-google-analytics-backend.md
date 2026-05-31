# CMS Google Analytics Backend Implementation

## Summary

The `content_api` backend now exposes Google Analytics 4 reporting for the CMS
Analytics page.

- GraphQL schema: `src/modules/cms/graphql/schemas/analytics.ts`
- GraphQL resolver: `src/modules/cms/graphql/queries/analytics.ts`
- Google API service: `src/modules/cms/utils/googleAnalytics.ts`
- CMS field: `googleAnalyticsPropertyId`
- Dependency: `@google-analytics/data`

## Auth Model

The implementation uses the Google Analytics Data API client with Application
Default Credentials. For a service-account deployment, set:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/google-service-account.json
```

For local development, the content API also supports the service account JSON in
an env var:

```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account", ...}'
```

Do not commit the service account JSON key. The service account email must have
Viewer access or higher on each GA4 property that erxes should report on.

## CMS Configuration

CMS settings now store a separate numeric GA4 property ID:

```ts
googleAnalyticsPropertyId?: string;
```

Do not reuse `googleTrackingId` for reports. `googleTrackingId` stores the
tracking or measurement ID such as `G-XXXXXXX`; GA4 Data API reports require the
numeric property ID passed to Google as `properties/PROPERTY_ID`.

## GraphQL Query

```graphql
query CmsAnalytics($clientPortalId: String!, $dateRange: CmsAnalyticsDateRange!) {
  cmsAnalytics(clientPortalId: $clientPortalId, dateRange: $dateRange) {
    dateRange
    startedAt
    endedAt
    configuration {
      propertyIdConfigured
      propertyIdMasked
    }
    totals {
      activeUsers
      newUsers
      sessions
      screenPageViews
      averageEngagementTime
      engagementRate
      eventCount
    }
    timeSeries {
      date
      activeUsers
      sessions
      screenPageViews
    }
    topPages {
      pagePath
      pageTitle
      screenPageViews
      activeUsers
      averageEngagementTime
    }
    trafficChannels {
      name
      activeUsers
      sessions
    }
    devices {
      name
      activeUsers
      sessions
    }
    countries {
      name
      activeUsers
      sessions
    }
    quota {
      tokensConsumed
      tokensRemaining
    }
  }
}
```

Supported date ranges:

- `LAST_7_DAYS`
- `LAST_28_DAYS`
- `LAST_90_DAYS`

## Service Behavior

- Missing CMS or missing `googleAnalyticsPropertyId` returns an empty report with
  `propertyIdConfigured: false`.
- Google reports are cached in memory for five minutes per property/date range.
- The service requests totals, daily trend, top pages, traffic channels, device
  categories, countries, and quota status.
- Google 403 and 429 errors are normalized to user-safe messages. Credentials,
  service account emails, keys, tokens, and raw Google errors are not returned.

## Official References

- GA4 Data API overview: https://developers.google.com/analytics/devguides/reporting/
- Report basics: https://developers.google.com/analytics/devguides/reporting/data/v1/basics
- Batch reports: https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/batchRunReports
- Quotas: https://developers.google.com/analytics/devguides/reporting/data/v1/quotas

## Validation

```bash
pnpm nx build content_api
pnpm nx build content_ui
```
