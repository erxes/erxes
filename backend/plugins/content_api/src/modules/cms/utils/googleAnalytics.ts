import {
  BetaAnalyticsDataClient,
  protos,
} from '@google-analytics/data';
import {
  CMS_ANALYTICS_DATE_RANGE_START_DATES,
  CmsAnalyticsDateRange,
  ICmsAnalyticsBreakdownItem,
  ICmsAnalyticsQuota,
  ICmsAnalyticsReport,
  ICmsAnalyticsTimeSeriesPoint,
  ICmsAnalyticsTopPage,
  ICmsAnalyticsTotals,
} from '@/cms/@types/analytics';

type RunReportRequest =
  protos.google.analytics.data.v1beta.IRunReportRequest;
type RunReportResponse =
  protos.google.analytics.data.v1beta.IRunReportResponse;
type RunReportRow = protos.google.analytics.data.v1beta.IRow;
type PropertyQuota = protos.google.analytics.data.v1beta.IPropertyQuota;
type QuotaStatus = protos.google.analytics.data.v1beta.IQuotaStatus;

type CachedAnalyticsReport = {
  expiresAt: number;
  report: ICmsAnalyticsReport;
};

type ReportRequestOptions = {
  dateRange: CmsAnalyticsDateRange;
  dimensions?: string[];
  limit?: number;
  metrics: string[];
  orderBys?: protos.google.analytics.data.v1beta.IOrderBy[];
  property: string;
  returnPropertyQuota?: boolean;
};

type CmsAnalyticsReportParams = {
  dateRange: CmsAnalyticsDateRange;
  propertyId: string;
};

type EmptyCmsAnalyticsReportParams = {
  dateRange: CmsAnalyticsDateRange;
  propertyId?: string;
  propertyIdConfigured: boolean;
};

type GoogleApiErrorLike = {
  code?: number | string;
  details?: string;
  message?: string;
  status?: string;
};

type GoogleCredentialsJson = {
  clientEmail: string;
  privateKey: string;
  projectId?: string;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const DEFAULT_END_DATE = 'today';
const NOT_SET_LABEL = '(not set)';
const GOOGLE_CREDENTIALS_JSON_ENV = 'GOOGLE_APPLICATION_CREDENTIALS_JSON';

const TOTAL_METRICS = [
  'activeUsers',
  'newUsers',
  'sessions',
  'screenPageViews',
  'averageEngagementTime',
  'engagementRate',
  'eventCount',
];

const BREAKDOWN_METRICS = ['activeUsers', 'sessions'];
const analyticsReportCache = new Map<string, CachedAnalyticsReport>();

let analyticsDataClient: BetaAnalyticsDataClient | undefined;

const getAnalyticsDataClient = () => {
  if (!analyticsDataClient) {
    const credentials = getGoogleCredentialsJson();

    analyticsDataClient = credentials
      ? new BetaAnalyticsDataClient({
          credentials: {
            client_email: credentials.clientEmail,
            private_key: credentials.privateKey,
          },
          projectId: credentials.projectId,
        })
      : new BetaAnalyticsDataClient();
  }

  return analyticsDataClient;
};

const getPropertyName = (propertyId: string) => `properties/${propertyId}`;

const emptyTotals: ICmsAnalyticsTotals = {
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
  screenPageViews: 0,
  averageEngagementTime: 0,
  engagementRate: 0,
  eventCount: 0,
};

const maskPropertyId = (propertyId?: string) => {
  if (!propertyId) {
    return null;
  }

  if (propertyId.length <= 4) {
    return '****';
  }

  return `${'*'.repeat(Math.max(propertyId.length - 4, 0))}${propertyId.slice(
    -4,
  )}`;
};

export const buildEmptyCmsAnalyticsReport = ({
  dateRange,
  propertyId,
  propertyIdConfigured,
}: EmptyCmsAnalyticsReportParams): ICmsAnalyticsReport => ({
  dateRange,
  startedAt: null,
  endedAt: null,
  configuration: {
    propertyIdConfigured,
    propertyIdMasked: maskPropertyId(propertyId),
  },
  totals: emptyTotals,
  timeSeries: [],
  topPages: [],
  trafficChannels: [],
  devices: [],
  countries: [],
  quota: null,
});

const createReportRequest = ({
  dateRange,
  dimensions = [],
  limit,
  metrics,
  orderBys,
  property,
  returnPropertyQuota,
}: ReportRequestOptions): RunReportRequest => ({
  property,
  dateRanges: [
    {
      startDate: CMS_ANALYTICS_DATE_RANGE_START_DATES[dateRange],
      endDate: DEFAULT_END_DATE,
    },
  ],
  dimensions: dimensions.map((name) => ({ name })),
  metrics: metrics.map((name) => ({ name })),
  orderBys,
  limit,
  returnPropertyQuota,
});

const toMetricNumber = (row: RunReportRow | undefined, index: number) => {
  const value = row?.metricValues?.[index]?.value;

  if (value === undefined || value === null || value === '') {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const toDimensionValue = (
  row: RunReportRow | undefined,
  index: number,
  fallback = '',
) => row?.dimensionValues?.[index]?.value || fallback;

const toDateRangeTimestamp = (
  dateRange: CmsAnalyticsDateRange,
  boundary: 'start' | 'end',
) => {
  const now = new Date();

  if (boundary === 'end') {
    return now.toISOString();
  }

  const days = Number(
    CMS_ANALYTICS_DATE_RANGE_START_DATES[dateRange].replace('daysAgo', ''),
  );
  const startDate = new Date(now);
  startDate.setUTCDate(startDate.getUTCDate() - days);

  return startDate.toISOString();
};

const mapTotals = (report?: RunReportResponse): ICmsAnalyticsTotals => {
  const row = report?.rows?.[0];

  return {
    activeUsers: toMetricNumber(row, 0),
    newUsers: toMetricNumber(row, 1),
    sessions: toMetricNumber(row, 2),
    screenPageViews: toMetricNumber(row, 3),
    averageEngagementTime: toMetricNumber(row, 4),
    engagementRate: toMetricNumber(row, 5),
    eventCount: toMetricNumber(row, 6),
  };
};

const mapTimeSeries = (
  report?: RunReportResponse,
): ICmsAnalyticsTimeSeriesPoint[] =>
  (report?.rows || [])
    .map((row) => ({
      date: toDimensionValue(row, 0),
      activeUsers: toMetricNumber(row, 0),
      sessions: toMetricNumber(row, 1),
      screenPageViews: toMetricNumber(row, 2),
    }))
    .filter((item) => Boolean(item.date));

const mapTopPages = (report?: RunReportResponse): ICmsAnalyticsTopPage[] =>
  (report?.rows || [])
    .map((row) => ({
      pagePath: toDimensionValue(row, 0, '/'),
      pageTitle: toDimensionValue(row, 1) || null,
      screenPageViews: toMetricNumber(row, 0),
      activeUsers: toMetricNumber(row, 1),
      averageEngagementTime: toMetricNumber(row, 2),
    }))
    .filter((item) => Boolean(item.pagePath));

const mapBreakdownItems = (
  report?: RunReportResponse,
): ICmsAnalyticsBreakdownItem[] =>
  (report?.rows || [])
    .map((row) => ({
      name: toDimensionValue(row, 0, NOT_SET_LABEL),
      activeUsers: toMetricNumber(row, 0),
      sessions: toMetricNumber(row, 1),
    }))
    .filter((item) => Boolean(item.name));

const getQuotaStatus = (quota?: PropertyQuota | null): QuotaStatus | null =>
  quota?.tokensPerHour || quota?.tokensPerDay || null;

const mapQuota = (
  quota?: PropertyQuota | null,
): ICmsAnalyticsQuota | null => {
  const status = getQuotaStatus(quota);

  if (!status) {
    return null;
  }

  return {
    tokensConsumed: status.consumed ?? null,
    tokensRemaining: status.remaining ?? null,
  };
};

const getCacheKey = ({ dateRange, propertyId }: CmsAnalyticsReportParams) =>
  `${propertyId}:${dateRange}`;

const getCachedReport = (key: string) => {
  const cached = analyticsReportCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    analyticsReportCache.delete(key);
    return null;
  }

  return cached.report;
};

const cacheReport = (key: string, report: ICmsAnalyticsReport) => {
  if (analyticsReportCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = analyticsReportCache.keys().next().value;

    if (oldestKey) {
      analyticsReportCache.delete(oldestKey);
    }
  }

  analyticsReportCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    report,
  });
};

const getUnknownRecordValue = (value: unknown, key: string) => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
};

const getStringRecordValue = (value: unknown, key: string) => {
  const recordValue = getUnknownRecordValue(value, key);

  return typeof recordValue === 'string' ? recordValue : undefined;
};

const getGoogleCredentialsJson = (): GoogleCredentialsJson | undefined => {
  const rawCredentials = process.env[GOOGLE_CREDENTIALS_JSON_ENV];

  if (!rawCredentials) {
    return undefined;
  }

  let parsedCredentials: unknown;

  try {
    parsedCredentials = JSON.parse(rawCredentials);
  } catch {
    throw new Error('Google Analytics credentials JSON is invalid.');
  }

  const clientEmail = getStringRecordValue(parsedCredentials, 'client_email');
  const privateKey = getStringRecordValue(parsedCredentials, 'private_key');
  const projectId = getStringRecordValue(parsedCredentials, 'project_id');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Analytics credentials JSON is incomplete.');
  }

  return {
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    projectId,
  };
};

const getGoogleApiError = (error: unknown): GoogleApiErrorLike => ({
  code: getUnknownRecordValue(error, 'code') as number | string | undefined,
  details: getUnknownRecordValue(error, 'details') as string | undefined,
  message: error instanceof Error ? error.message : undefined,
  status: getUnknownRecordValue(error, 'status') as string | undefined,
});

const normalizeGoogleAnalyticsError = (error: unknown) => {
  const apiError = getGoogleApiError(error);
  const message = [
    apiError.message,
    apiError.details,
    apiError.status,
    String(apiError.code || ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    apiError.code === 401 ||
    apiError.status === 'UNAUTHENTICATED' ||
    message.includes('could not load the default credentials') ||
    message.includes('application default credentials') ||
    message.includes('google_application_credentials') ||
    message.includes('invalid_grant') ||
    message.includes('private_key')
  ) {
    return new Error('Google Analytics credentials are not configured correctly.');
  }

  if (
    apiError.code === 403 ||
    apiError.status === 'PERMISSION_DENIED' ||
    message.includes('permission_denied') ||
    message.includes('permission denied')
  ) {
    return new Error('Google Analytics access denied for this property.');
  }

  if (
    apiError.code === 3 ||
    apiError.status === 'INVALID_ARGUMENT' ||
    message.includes('invalid argument') ||
    message.includes('property id')
  ) {
    return new Error('Google Analytics property ID is invalid.');
  }

  if (
    apiError.code === 429 ||
    apiError.status === 'RESOURCE_EXHAUSTED' ||
    message.includes('quota') ||
    message.includes('resource_exhausted')
  ) {
    return new Error('Google Analytics quota was exceeded. Try again later.');
  }

  return new Error('Google Analytics report is unavailable.');
};

export const getCmsAnalyticsReport = async ({
  dateRange,
  propertyId,
}: CmsAnalyticsReportParams): Promise<ICmsAnalyticsReport> => {
  const cacheKey = getCacheKey({ dateRange, propertyId });
  const cachedReport = getCachedReport(cacheKey);

  if (cachedReport) {
    return cachedReport;
  }

  const property = getPropertyName(propertyId);
  const client = getAnalyticsDataClient();

  try {
    const [batchResponse] = await client.batchRunReports({
      property,
      requests: [
        createReportRequest({
          dateRange,
          metrics: TOTAL_METRICS,
          property,
          returnPropertyQuota: true,
        }),
        createReportRequest({
          dateRange,
          dimensions: ['date'],
          metrics: ['activeUsers', 'sessions', 'screenPageViews'],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
          property,
        }),
        createReportRequest({
          dateRange,
          dimensions: ['pagePath', 'pageTitle'],
          limit: 10,
          metrics: ['screenPageViews', 'activeUsers', 'averageEngagementTime'],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          property,
        }),
        createReportRequest({
          dateRange,
          dimensions: ['sessionDefaultChannelGroup'],
          limit: 8,
          metrics: BREAKDOWN_METRICS,
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          property,
        }),
        createReportRequest({
          dateRange,
          dimensions: ['deviceCategory'],
          limit: 8,
          metrics: BREAKDOWN_METRICS,
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          property,
        }),
      ],
    });

    const [countriesReport] = await client.runReport(
      createReportRequest({
        dateRange,
        dimensions: ['country'],
        limit: 8,
        metrics: BREAKDOWN_METRICS,
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        property,
      }),
    );

    const reports = batchResponse.reports || [];
    const totalsReport = reports[0];
    const report: ICmsAnalyticsReport = {
      dateRange,
      startedAt: toDateRangeTimestamp(dateRange, 'start'),
      endedAt: toDateRangeTimestamp(dateRange, 'end'),
      configuration: {
        propertyIdConfigured: true,
        propertyIdMasked: maskPropertyId(propertyId),
      },
      totals: mapTotals(totalsReport),
      timeSeries: mapTimeSeries(reports[1]),
      topPages: mapTopPages(reports[2]),
      trafficChannels: mapBreakdownItems(reports[3]),
      devices: mapBreakdownItems(reports[4]),
      countries: mapBreakdownItems(countriesReport),
      quota: mapQuota(totalsReport?.propertyQuota),
    };

    cacheReport(cacheKey, report);

    return report;
  } catch (error) {
    throw normalizeGoogleAnalyticsError(error);
  }
};
