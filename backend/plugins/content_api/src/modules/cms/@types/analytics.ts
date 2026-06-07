export const CMS_ANALYTICS_DATE_RANGES = [
  'LAST_7_DAYS',
  'LAST_28_DAYS',
  'LAST_90_DAYS',
] as const;

export type CmsAnalyticsDateRange =
  (typeof CMS_ANALYTICS_DATE_RANGES)[number];

export const CMS_ANALYTICS_DATE_RANGE_START_DATES: Record<
  CmsAnalyticsDateRange,
  string
> = {
  LAST_7_DAYS: '7daysAgo',
  LAST_28_DAYS: '28daysAgo',
  LAST_90_DAYS: '90daysAgo',
};

export interface ICmsAnalyticsConfiguration {
  propertyIdConfigured: boolean;
  propertyIdMasked?: string | null;
}

export interface ICmsAnalyticsTotals {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  averageEngagementTime: number;
  engagementRate: number;
  eventCount: number;
}

export interface ICmsAnalyticsTimeSeriesPoint {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
}

export interface ICmsAnalyticsTopPage {
  pagePath: string;
  pageTitle?: string | null;
  screenPageViews: number;
  activeUsers: number;
  averageEngagementTime: number;
}

export interface ICmsAnalyticsBreakdownItem {
  name: string;
  activeUsers: number;
  sessions: number;
}

export interface ICmsAnalyticsQuota {
  tokensConsumed?: number | null;
  tokensRemaining?: number | null;
}

export interface ICmsAnalyticsReport {
  dateRange: CmsAnalyticsDateRange;
  startedAt?: string | null;
  endedAt?: string | null;
  configuration: ICmsAnalyticsConfiguration;
  totals: ICmsAnalyticsTotals;
  timeSeries: ICmsAnalyticsTimeSeriesPoint[];
  topPages: ICmsAnalyticsTopPage[];
  trafficChannels: ICmsAnalyticsBreakdownItem[];
  devices: ICmsAnalyticsBreakdownItem[];
  countries: ICmsAnalyticsBreakdownItem[];
  quota?: ICmsAnalyticsQuota | null;
}

export interface ICmsAnalyticsQueryArgs {
  clientPortalId: string;
  dateRange: CmsAnalyticsDateRange;
}
