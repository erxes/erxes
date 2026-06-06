import {
  IconActivity,
  IconClock,
  IconEye,
  IconPointer,
  IconUsers,
  IconUserPlus,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { type AnalyticsKpiGridProps } from '../types';
import {
  formatAnalyticsDuration,
  formatAnalyticsNumber,
  formatAnalyticsPercent,
} from '../utils/formatAnalytics';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';

export const AnalyticsKpiGrid = ({ totals }: AnalyticsKpiGridProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics.metrics',
  });

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <AnalyticsMetricCard
        icon={IconUsers}
        label={t('active-users')}
        value={formatAnalyticsNumber(totals.activeUsers)}
      />
      <AnalyticsMetricCard
        icon={IconUserPlus}
        label={t('new-users')}
        value={formatAnalyticsNumber(totals.newUsers)}
      />
      <AnalyticsMetricCard
        icon={IconPointer}
        label={t('sessions')}
        value={formatAnalyticsNumber(totals.sessions)}
      />
      <AnalyticsMetricCard
        icon={IconEye}
        label={t('views')}
        value={formatAnalyticsNumber(totals.screenPageViews)}
      />
      <AnalyticsMetricCard
        icon={IconClock}
        label={t('average-engagement-time')}
        value={formatAnalyticsDuration(totals.averageEngagementTime)}
      />
      <AnalyticsMetricCard
        icon={IconActivity}
        label={t('engagement-rate')}
        value={formatAnalyticsPercent(totals.engagementRate)}
      />
    </div>
  );
};
