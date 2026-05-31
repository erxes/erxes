export const types = `
  enum CmsAnalyticsDateRange {
    LAST_7_DAYS
    LAST_28_DAYS
    LAST_90_DAYS
  }

  type CmsAnalyticsConfiguration {
    propertyIdConfigured: Boolean!
    propertyIdMasked: String
  }

  type CmsAnalyticsTotals {
    activeUsers: Float!
    newUsers: Float!
    sessions: Float!
    screenPageViews: Float!
    averageEngagementTime: Float!
    engagementRate: Float!
    eventCount: Float!
  }

  type CmsAnalyticsTimeSeriesPoint {
    date: String!
    activeUsers: Float!
    sessions: Float!
    screenPageViews: Float!
  }

  type CmsAnalyticsTopPage {
    pagePath: String!
    pageTitle: String
    screenPageViews: Float!
    activeUsers: Float!
    averageEngagementTime: Float!
  }

  type CmsAnalyticsBreakdownItem {
    name: String!
    activeUsers: Float!
    sessions: Float!
  }

  type CmsAnalyticsQuota {
    tokensConsumed: Float
    tokensRemaining: Float
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
`;

export const queries = `
  cmsAnalytics(
    clientPortalId: String!
    dateRange: CmsAnalyticsDateRange!
  ): CmsAnalyticsReport!
`;
