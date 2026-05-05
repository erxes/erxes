export interface GaConfig {
  propertyId: string;
  clientId: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface OverviewPoint {
  date: string;
  sessions: number;
  pageviews: number;
  users: number;
}

export interface TopPage {
  path: string;
  title: string;
  pageviews: number;
  sessions: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalPageviews: number;
  totalUsers: number;
  avgBounceRate: number;
}
