# CMS Analytics Implementation Notes

## Summary

The CMS frontend now has a Google Analytics page wired into the `content_ui`
CMS area and backed by the `content_api` Google Analytics Data API query.

- Route: `/content/cms/:websiteId/analytics`
- Sidebar placement: directly above `Settings`
- Frontend module: `frontend/plugins/content_ui/src/modules/cms/analytics`
- Backend query: `cmsAnalytics(clientPortalId, dateRange)`
- CMS settings field: `googleAnalyticsPropertyId`

## Implemented Frontend Work

- Added `PostsPath.Analytics = '/analytics'`.
- Added the Analytics sidebar tab before Settings in `usePostsFieldTypes`.
- Added the lazy Analytics route in `src/modules/cms/Main.tsx`.
- Added an Analytics page with date range switching, refresh, KPI cards,
  trend chart, top pages, channel/device/country breakdowns, loading, error,
  no-CMS, not-configured, and no-data states.
- Added the GraphQL query document:
  `query CmsAnalytics($clientPortalId: String!, $dateRange: CmsAnalyticsDateRange!)`.
- Added English and Mongolian translation keys under `common.cms.analytics`.
- Added the GA4 numeric property ID field to CMS settings persistence.

## Important Behavior

- No mock analytics data is rendered.
- If the backend query errors, the UI shows the backend-unavailable state.
- If the backend returns `propertyIdConfigured: false`, the UI shows the
  not-configured state.
- The existing CMS `googleTrackingId` field is still used for tracking script
  configuration. Reports use `googleAnalyticsPropertyId` because GA4 Data API
  reporting requires the numeric property ID, not the `G-...` measurement ID.

## Backend Contract

```graphql
enum CmsAnalyticsDateRange {
  LAST_7_DAYS
  LAST_28_DAYS
  LAST_90_DAYS
}

type CmsAnalyticsReport {
  dateRange: CmsAnalyticsDateRange!
  startedAt: String
  endedAt: String
  configuration: CmsAnalyticsConfiguration!
  totals: CmsAnalyticsTotals!
  timeSeries: [CmsAnalyticsTimeSeriesPoint!]!
  topPages: [CmsAnalyticsTopPage!]!
  trafficChannels: [CmsAnalyticsBreakdownItem!]!
  devices: [CmsAnalyticsBreakdownItem!]!
  countries: [CmsAnalyticsBreakdownItem!]!
  quota: CmsAnalyticsQuota
}

extend type Query {
  cmsAnalytics(
    clientPortalId: String!
    dateRange: CmsAnalyticsDateRange!
  ): CmsAnalyticsReport!
}
```

## Validation

```bash
pnpm nx build content_ui
pnpm nx build content_api
```
