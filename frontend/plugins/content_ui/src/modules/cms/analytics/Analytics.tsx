import { IconAlertCircle, IconChartHistogram } from '@tabler/icons-react';
import { PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useCmsAnalyticsSettings } from '../shared/hooks/useCmsAnalyticsSettings';
import { CmsSidebar } from '../shared/CmsSidebar';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { AnalyticsSkeleton } from './components/AnalyticsSkeleton';
import { AnalyticsState } from './components/AnalyticsState';
import { useCmsAnalytics } from './hooks/useCmsAnalytics';
import { CmsAnalyticsDateRange } from './types';

export const Analytics = () => {
  const { websiteId } = useParams();
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics',
  });
  const [dateRange, setDateRange] =
    useState<CmsAnalyticsDateRange>('LAST_28_DAYS');
  const { hasAnalyticsSettings, loading: settingsLoading } =
    useCmsAnalyticsSettings(websiteId);
  const { error, loading, refetch, report } = useCmsAnalytics({
    clientPortalId: hasAnalyticsSettings ? websiteId : undefined,
    dateRange,
  });
  const analyticsLoading = settingsLoading || loading;
  const isInitialAnalyticsLoading = analyticsLoading && !report;

  if (websiteId && !settingsLoading && !hasAnalyticsSettings) {
    return <Navigate to={`/content/cms/${websiteId}/cmssettings`} replace />;
  }

  let analyticsContent = (
    <AnalyticsState
      icon={IconChartHistogram}
      title={t('no-cms-title')}
      description={t('no-cms-description')}
    />
  );

  if (isInitialAnalyticsLoading) {
    analyticsContent = <AnalyticsSkeleton />;
  } else if (websiteId && error) {
    analyticsContent = (
      <AnalyticsState
        actionLabel={t('retry')}
        icon={IconAlertCircle}
        title={t('backend-unavailable-title')}
        description={t('backend-unavailable-description')}
        onAction={refetch}
      />
    );
  } else if (websiteId && report) {
    analyticsContent = <AnalyticsDashboard report={report} />;
  } else if (websiteId) {
    analyticsContent = (
      <AnalyticsState
        icon={IconChartHistogram}
        title={t('not-configured-title')}
        description={t('not-configured-description')}
      />
    );
  }

  return (
    <PageContainer>
      <AnalyticsHeader
        dateRange={dateRange}
        loading={analyticsLoading}
        onDateRangeChange={setDateRange}
        onRefresh={refetch}
      />
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="min-w-0 flex-1 overflow-auto bg-muted/20">
          {analyticsContent}
        </div>
      </div>
    </PageContainer>
  );
};
