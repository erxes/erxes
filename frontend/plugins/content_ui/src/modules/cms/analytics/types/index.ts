export const CMS_ANALYTICS_DATE_RANGES = [
  'LAST_7_DAYS',
  'LAST_28_DAYS',
  'LAST_90_DAYS',
] as const;

export type CmsAnalyticsDateRange =
  (typeof CMS_ANALYTICS_DATE_RANGES)[number];

export type CmsAnalyticsConfiguration = {
  propertyIdConfigured: boolean;
  propertyIdMasked?: string | null;
};

export type CmsAnalyticsTotals = {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  averageEngagementTime: number;
  engagementRate: number;
  eventCount: number;
};

export type CmsAnalyticsTimeSeriesPoint = {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
};

export type CmsAnalyticsTopPage = {
  pagePath: string;
  pageTitle?: string | null;
  screenPageViews: number;
  activeUsers: number;
  averageEngagementTime: number;
};

export type CmsAnalyticsBreakdownItem = {
  name: string;
  activeUsers: number;
  sessions: number;
};

export type CmsAnalyticsQuota = {
  tokensConsumed?: number | null;
  tokensRemaining?: number | null;
};

export type CmsAnalyticsReport = {
  dateRange: CmsAnalyticsDateRange;
  startedAt?: string | null;
  endedAt?: string | null;
  configuration: CmsAnalyticsConfiguration;
  totals: CmsAnalyticsTotals;
  timeSeries: CmsAnalyticsTimeSeriesPoint[];
  topPages: CmsAnalyticsTopPage[];
  trafficChannels: CmsAnalyticsBreakdownItem[];
  devices: CmsAnalyticsBreakdownItem[];
  countries: CmsAnalyticsBreakdownItem[];
  quota?: CmsAnalyticsQuota | null;
};

export type CmsAnalyticsQueryResponse = {
  cmsAnalytics: CmsAnalyticsReport | null;
};

export type CmsAnalyticsQueryVariables = {
  clientPortalId: string;
  dateRange: CmsAnalyticsDateRange;
};

export const isCmsAnalyticsDateRange = (
  value: string,
): value is CmsAnalyticsDateRange =>
  CMS_ANALYTICS_DATE_RANGES.includes(value as CmsAnalyticsDateRange);
