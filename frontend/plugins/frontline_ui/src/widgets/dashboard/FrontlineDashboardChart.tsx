import { ReportChartEmbedProvider } from '@/report/components/frontline-card/ReportChartEmbed';
import {
  facebookReportComponents,
  reportComponents,
  ticketReportComponents,
} from '@/report/types/component-registry';
import { Button } from 'erxes-ui';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  DashboardWidgetCard,
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
  TDashboardWidgetConfig,
} from 'ui-modules';
import {
  DASHBOARD_ALL_TIME,
  DEFAULT_FRONTLINE_DASHBOARD_CONFIG,
  frontlineDashboardConfigSchema,
  toDashboardReportChart,
} from './frontlineDashboardConfig';
import {
  getFrontlineDashboardWidget,
  TFrontlineDashboardGroup,
} from './frontlineDashboardWidgets';

const REGISTRIES = {
  conversation: reportComponents,
  ticket: ticketReportComponents,
  facebook: facebookReportComponents,
} as const;

const REPORT_PATHS: Record<TFrontlineDashboardGroup, string> = {
  conversation: '/frontline/reports',
  ticket: '/frontline/reports?reportModule=ticket',
  facebook: '/frontline/reports?reportModule=facebook',
};

/** One report chart in a home dashboard tile, drawn from its stored filters. */
export const FrontlineDashboardChart = ({
  module,
  config,
}: Readonly<{ module: string; config?: TDashboardWidgetConfig | null }>) => {
  const { t } = useTranslation('frontline');
  const widget = getFrontlineDashboardWidget(module);
  const Chart = widget ? REGISTRIES[widget.group][module] : undefined;

  const parsedConfig = useMemo(() => {
    const parsed = frontlineDashboardConfigSchema.safeParse(config);

    return parsed.success ? parsed.data : DEFAULT_FRONTLINE_DASHBOARD_CONFIG;
  }, [config]);
  const savedChart = useMemo(
    () => toDashboardReportChart(module, parsedConfig),
    [module, parsedConfig],
  );

  const chartTitle = t(`${module}-title`);
  const { date } = parsedConfig.filters;
  const title =
    date === DASHBOARD_ALL_TIME ? chartTitle : `${chartTitle} · ${t(date)}`;

  return (
    <DashboardWidgetCard
      title={title}
      action={
        widget && (
          <Button variant="ghost" size="sm" asChild>
            <Link to={REPORT_PATHS[widget.group]}>
              {t('dashboard.open-report')}
            </Link>
          </Button>
        )
      }
    >
      {Chart ? (
        <ReportChartEmbedProvider>
          <Suspense fallback={<DashboardWidgetListSkeleton />}>
            <Chart
              title={chartTitle}
              cardId={savedChart._id}
              savedChart={savedChart}
              colSpan={widget?.defaultSize.w === 12 ? 12 : 6}
            />
          </Suspense>
        </ReportChartEmbedProvider>
      ) : (
        <DashboardWidgetEmptyState>
          {t('dashboard.unknown-widget')}
        </DashboardWidgetEmptyState>
      )}
    </DashboardWidgetCard>
  );
};
