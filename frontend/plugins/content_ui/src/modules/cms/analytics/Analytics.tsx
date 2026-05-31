import { IconAlertCircle, IconChartHistogram } from '@tabler/icons-react';
import { PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
  const { error, loading, refetch, report } = useCmsAnalytics({
    clientPortalId: websiteId,
    dateRange,
  });

  return (
    <PageContainer>
      <AnalyticsHeader
        dateRange={dateRange}
        loading={loading}
        onDateRangeChange={setDateRange}
        onRefresh={refetch}
      />
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="min-w-0 flex-1 overflow-auto bg-muted/20">
          {loading && !report ? (
            <AnalyticsSkeleton />
          ) : !websiteId ? (
            <AnalyticsState
              icon={IconChartHistogram}
              title={t('no-cms-title')}
              description={t('no-cms-description')}
            />
          ) : error ? (
            <AnalyticsState
              actionLabel={t('retry')}
              icon={IconAlertCircle}
              title={t('backend-unavailable-title')}
              description={t('backend-unavailable-description')}
              onAction={refetch}
            />
          ) : report ? (
            <AnalyticsDashboard report={report} />
          ) : (
            <AnalyticsState
              icon={IconChartHistogram}
              title={t('not-configured-title')}
              description={t('not-configured-description')}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
};
