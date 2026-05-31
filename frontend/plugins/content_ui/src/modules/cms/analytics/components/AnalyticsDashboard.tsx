import { IconDatabaseOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CmsAnalyticsReport } from '../types';
import { AnalyticsBreakdownList } from './AnalyticsBreakdownList';
import { AnalyticsKpiGrid } from './AnalyticsKpiGrid';
import { AnalyticsState } from './AnalyticsState';
import { AnalyticsTopPagesTable } from './AnalyticsTopPagesTable';
import { AnalyticsTrendChart } from './AnalyticsTrendChart';

type AnalyticsDashboardProps = {
  report: CmsAnalyticsReport;
};

const hasReportData = (report: CmsAnalyticsReport) =>
  report.timeSeries.length > 0 ||
  report.topPages.length > 0 ||
  report.totals.sessions > 0 ||
  report.totals.screenPageViews > 0;

export const AnalyticsDashboard = ({ report }: AnalyticsDashboardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics',
  });

  if (!report.configuration.propertyIdConfigured) {
    return (
      <AnalyticsState
        icon={IconDatabaseOff}
        title={t('not-configured-title')}
        description={t('not-configured-description')}
      />
    );
  }

  if (!hasReportData(report)) {
    return (
      <AnalyticsState
        icon={IconDatabaseOff}
        title={t('no-data-title')}
        description={t('no-data-description')}
      />
    );
  }

  return (
    <div className="space-y-4 p-4">
      <AnalyticsKpiGrid totals={report.totals} />
      <AnalyticsTrendChart data={report.timeSeries} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <AnalyticsTopPagesTable pages={report.topPages} />
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <AnalyticsBreakdownList
            title={t('channels-title')}
            items={report.trafficChannels}
          />
          <AnalyticsBreakdownList
            title={t('devices-title')}
            items={report.devices}
          />
          <AnalyticsBreakdownList
            title={t('countries-title')}
            items={report.countries}
          />
        </div>
      </div>
    </div>
  );
};
