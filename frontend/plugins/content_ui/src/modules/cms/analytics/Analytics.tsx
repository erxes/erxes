import {
  IconChartBar,
  IconEye,
  IconRefresh,
  IconSettings,
  IconUnlink,
  IconUsers,
  IconWorldWww,
} from '@tabler/icons-react';
import { Button, PageContainer, Select } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CmsSidebar } from '../shared/CmsSidebar';
import { AnalyticsSetup } from './components/AnalyticsSetup';
import { MetricCard } from './components/MetricCard';
import { OverviewChart } from './components/OverviewChart';
import { TopPagesTable } from './components/TopPagesTable';
import { TrafficSources } from './components/TrafficSources';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';
import { DateRange, GaConfig } from './types';

const DATE_RANGES: DateRange[] = [
  { label: 'Last 7 days', startDate: '7daysAgo', endDate: 'today' },
  { label: 'Last 30 days', startDate: '30daysAgo', endDate: 'today' },
  { label: 'Last 90 days', startDate: '90daysAgo', endDate: 'today' },
  { label: 'Last 12 months', startDate: '365daysAgo', endDate: 'today' },
];

function getConfigKey(websiteId: string) {
  return `cms_ga_config_${websiteId}`;
}

function loadConfig(websiteId: string): GaConfig | null {
  try {
    const raw = localStorage.getItem(getConfigKey(websiteId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConfig(websiteId: string, config: GaConfig) {
  localStorage.setItem(getConfigKey(websiteId), JSON.stringify(config));
}

function removeConfig(websiteId: string) {
  localStorage.removeItem(getConfigKey(websiteId));
}

export function Analytics() {
  const { websiteId = '' } = useParams();
  const [config, setConfig] = useState<GaConfig | null>(() => loadConfig(websiteId));
  const [showSetup, setShowSetup] = useState(false);
  const [dateRangeIndex, setDateRangeIndex] = useState(1);
  const dateRange = DATE_RANGES[dateRangeIndex];

  const {
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
    refetch,
  } = useGoogleAnalytics(config, dateRange);

  const handleSaveConfig = (newConfig: GaConfig) => {
    saveConfig(websiteId, newConfig);
    setConfig(newConfig);
    setShowSetup(false);
  };

  const handleDisconnect = () => {
    disconnect();
    removeConfig(websiteId);
    setConfig(null);
  };

  const formattedSummary = useMemo(() => {
    if (!summary) return null;
    return {
      sessions: summary.totalSessions.toLocaleString(),
      pageviews: summary.totalPageviews.toLocaleString(),
      users: summary.totalUsers.toLocaleString(),
      bounceRate: `${(summary.avgBounceRate * 100).toFixed(1)}%`,
    };
  }, [summary]);

  if (!config || showSetup) {
    return (
      <PageContainer>
        <div className="flex overflow-hidden flex-auto">
          <CmsSidebar />
          <div className="flex-auto overflow-auto">
            <AnalyticsSetup
              initialConfig={config}
              onSave={handleSaveConfig}
            />
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex flex-col flex-auto overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b flex-none">
            <div className="flex items-center gap-2">
              <IconChartBar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Analytics</span>
              <span className="text-xs text-muted-foreground">
                Property: {config.propertyId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(dateRangeIndex)}
                onValueChange={(v) => setDateRangeIndex(Number(v))}
              >
                <Select.Trigger className="w-36 h-8 text-sm">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {DATE_RANGES.map((r, i) => (
                    <Select.Item key={i} value={String(i)}>
                      {r.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>

              {isConnected ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refetch}
                    disabled={loading}
                  >
                    <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDisconnect}
                    title="Disconnect"
                  >
                    <IconUnlink className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={connect} disabled={connecting}>
                  {connecting ? 'Connecting...' : 'Connect Google'}
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSetup(true)}
                title="Settings"
              >
                <IconSettings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-auto overflow-auto p-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {!isConnected && !error && (
              <div className="text-center py-16 space-y-3">
                <IconChartBar className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm">
                  Connect your Google account to view analytics data
                </p>
                <Button onClick={connect} disabled={connecting}>
                  {connecting ? 'Connecting...' : 'Sign in with Google'}
                </Button>
              </div>
            )}

            {isConnected && (
              <>
                {/* Metric cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <MetricCard
                    label="Sessions"
                    value={formattedSummary?.sessions ?? '—'}
                    icon={IconWorldWww}
                    loading={loading}
                  />
                  <MetricCard
                    label="Pageviews"
                    value={formattedSummary?.pageviews ?? '—'}
                    icon={IconEye}
                    loading={loading}
                  />
                  <MetricCard
                    label="Users"
                    value={formattedSummary?.users ?? '—'}
                    icon={IconUsers}
                    loading={loading}
                  />
                  <MetricCard
                    label="Bounce Rate"
                    value={formattedSummary?.bounceRate ?? '—'}
                    icon={IconChartBar}
                    loading={loading}
                  />
                </div>

                {/* Chart */}
                <OverviewChart data={timeline} loading={loading} />

                {/* Bottom row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TopPagesTable data={topPages} loading={loading} />
                  <TrafficSources data={sources} loading={loading} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
