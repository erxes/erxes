import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnalyticsSummary,
  DateRange,
  GaConfig,
  OverviewPoint,
  TopPage,
  TrafficSource,
} from '../types';

const GA4_API = 'https://analyticsdata.googleapis.com/v1beta/properties';
const GIS_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

declare global {
  interface Window {
    google?: any;
  }
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

async function runReport(
  propertyId: string,
  accessToken: string,
  body: object,
): Promise<any> {
  const res = await fetch(`${GA4_API}/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `GA4 API error ${res.status}`);
  }
  return res.json();
}

function getMetric(row: any, index: number): number {
  return parseFloat(row?.metricValues?.[index]?.value || '0');
}

function getDimension(row: any, index: number): string {
  return row?.dimensionValues?.[index]?.value || '';
}

export function useGoogleAnalytics(config: GaConfig | null, dateRange: DateRange) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeline, setTimeline] = useState<OverviewPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [sources, setSources] = useState<TrafficSource[]>([]);

  const tokenClientRef = useRef<any>(null);

  const isConnected = Boolean(accessToken);

  const initTokenClient = useCallback(async (clientId: string) => {
    await loadGisScript();
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GIS_SCOPE,
      callback: (response: any) => {
        setConnecting(false);
        if (response.error) {
          setError(response.error_description || response.error);
          return;
        }
        setAccessToken(response.access_token);
        setError(null);
      },
    });
  }, []);

  useEffect(() => {
    if (config?.clientId) {
      initTokenClient(config.clientId);
    }
  }, [config?.clientId, initTokenClient]);

  const connect = useCallback(() => {
    if (!tokenClientRef.current) return;
    setConnecting(true);
    tokenClientRef.current.requestAccessToken();
  }, []);

  const disconnect = useCallback(() => {
    if (accessToken) {
      window.google?.accounts?.oauth2?.revoke(accessToken, () => {});
    }
    setAccessToken(null);
    setSummary(null);
    setTimeline([]);
    setTopPages([]);
    setSources([]);
  }, [accessToken]);

  const fetchData = useCallback(async () => {
    if (!config || !accessToken) return;
    const { propertyId } = config;
    const dateRanges = [{ startDate: dateRange.startDate, endDate: dateRange.endDate }];

    setLoading(true);
    setError(null);

    try {
      const [overviewRes, topPagesRes, sourcesRes] = await Promise.all([
        runReport(propertyId, accessToken, {
          dateRanges,
          metrics: [
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'totalUsers' },
            { name: 'bounceRate' },
          ],
          dimensions: [{ name: 'date' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        }),
        runReport(propertyId, accessToken, {
          dateRanges,
          metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
          dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
          limit: 10,
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        }),
        runReport(propertyId, accessToken, {
          dateRanges,
          metrics: [{ name: 'sessions' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        }),
      ]);

      const rows: any[] = overviewRes.rows || [];
      let totalSessions = 0;
      let totalPageviews = 0;
      let totalUsers = 0;
      let bounceSum = 0;

      const points: OverviewPoint[] = rows.map((row) => {
        const raw = getDimension(row, 0);
        const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
        const sessions = getMetric(row, 0);
        const pageviews = getMetric(row, 1);
        const users = getMetric(row, 2);
        const bounce = getMetric(row, 3);
        totalSessions += sessions;
        totalPageviews += pageviews;
        totalUsers += users;
        bounceSum += bounce;
        return { date, sessions, pageviews, users };
      });

      setSummary({
        totalSessions,
        totalPageviews,
        totalUsers,
        avgBounceRate: rows.length ? bounceSum / rows.length : 0,
      });
      setTimeline(points);

      setTopPages(
        (topPagesRes.rows || []).map((row: any) => ({
          path: getDimension(row, 0),
          title: getDimension(row, 1),
          pageviews: getMetric(row, 0),
          sessions: getMetric(row, 1),
        })),
      );

      setSources(
        (sourcesRes.rows || []).map((row: any) => ({
          source: getDimension(row, 0) || 'Direct',
          sessions: getMetric(row, 0),
        })),
      );
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
      if (err.message?.includes('401') || err.message?.includes('invalid_token')) {
        setAccessToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [config, accessToken, dateRange]);

  useEffect(() => {
    if (isConnected && config) {
      fetchData();
    }
  }, [isConnected, config, dateRange.startDate, dateRange.endDate]);

  return {
    isConnected,
    connecting,
    connect,
    disconnect,
    loading,
    error,
    summary,
    timeline,
    topPages,
    sources,
    refetch: fetchData,
  };
}
