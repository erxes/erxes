import { useTranslation } from 'react-i18next';
import { CustomersInline, TDashboardWidgetConfig } from 'ui-modules';
import {
  LoyaltyGroupTable,
  LoyaltyKpiTiles,
  LoyaltyRankedRows,
} from '@/loyalty-points/components/LoyaltyInsightSections';
import {
  LoyaltyFlowChart,
  LoyaltyRunningNetChart,
} from '@/loyalty-points/components/LoyaltyTimelineSections';
import { TLoyaltySummary } from '@/loyalty-points/summary';
import {
  useSalesLoyaltyWidgetInsights,
  useSalesLoyaltyWidgetTimeline,
} from '../hooks/useSalesLoyaltyWidgetData';
import { SalesLoyaltyWidgetCard } from './SalesLoyaltyWidgetCard';

type TSalesLoyaltyWidgetProps = { config?: TDashboardWidgetConfig | null };

const isQuietSummary = ({ kinds, recalculated }: TLoyaltySummary) =>
  !kinds.earned &&
  !kinds.spent &&
  !kinds.refunded &&
  !kinds.other &&
  !recalculated;

/** Earned, spent, refunded, net, rates and counts. */
export const SalesLoyaltyKpisWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => {
  const { t } = useTranslation('sales');
  const insights = useSalesLoyaltyWidgetInsights(config);

  return (
    <SalesLoyaltyWidgetCard
      title={t('dashboard-loyalty-kpis', 'Loyalty points')}
      loyaltyEnabled={insights.loyaltyEnabled}
      loading={insights.loading}
      error={insights.error}
      onRetry={insights.refetch}
      isEmpty={isQuietSummary(insights.summary)}
    >
      {/* Columns follow the tile's width, not the window's. */}
      <div className="@container flex flex-col gap-2">
        <LoyaltyKpiTiles
          summary={insights.summary}
          records={{
            label: t('loyalty-insight-deals', 'Deals'),
            count: insights.dealCount,
          }}
          loading={false}
          gridClassName="grid-cols-2 @lg:grid-cols-4 @4xl:grid-cols-8"
        />
      </div>
    </SalesLoyaltyWidgetCard>
  );
};

/** Earned, spent and refunded per period, with the net as a line. */
export const SalesLoyaltyFlowWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => {
  const { t } = useTranslation('sales');
  const timeline = useSalesLoyaltyWidgetTimeline(config);

  return (
    <SalesLoyaltyWidgetCard
      title={t('loyalty-timeline-flow', 'Points moved per period')}
      loyaltyEnabled={timeline.loyaltyEnabled}
      loading={timeline.loading}
      error={timeline.error}
      onRetry={timeline.refetch}
      isEmpty={timeline.isEmpty}
    >
      <LoyaltyFlowChart
        periods={timeline.periods}
        interval={timeline.interval}
        className="h-full min-h-40"
      />
    </SalesLoyaltyWidgetCard>
  );
};

/** The deals' running net over time; not a wallet balance. */
export const SalesLoyaltyRunningNetWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => {
  const { t } = useTranslation('sales');
  const timeline = useSalesLoyaltyWidgetTimeline(config);

  return (
    <SalesLoyaltyWidgetCard
      title={t(
        'loyalty-timeline-cumulative',
        'Running net of these records (not a wallet balance)',
      )}
      loyaltyEnabled={timeline.loyaltyEnabled}
      loading={timeline.loading}
      error={timeline.error}
      onRetry={timeline.refetch}
      isEmpty={timeline.isEmpty}
    >
      <LoyaltyRunningNetChart
        periods={timeline.periods}
        className="h-full min-h-40"
      />
    </SalesLoyaltyWidgetCard>
  );
};

/** Earned, spent, refunded and net per pipeline. */
export const SalesLoyaltyByPipelineWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => {
  const { t } = useTranslation('sales');
  const insights = useSalesLoyaltyWidgetInsights(config);

  return (
    <SalesLoyaltyWidgetCard
      title={t('loyalty-insight-by-pipeline', 'Points by pipeline')}
      loyaltyEnabled={insights.loyaltyEnabled}
      loading={insights.loading}
      error={insights.error}
      onRetry={insights.refetch}
      isEmpty={!insights.pipelines.length}
    >
      <LoyaltyGroupTable
        label={t('pipeline', 'Pipeline')}
        lines={insights.pipelines}
      />
    </SalesLoyaltyWidgetCard>
  );
};

/** The ten deals that earned the most points. */
export const SalesLoyaltyTopDealsWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => {
  const { t } = useTranslation('sales');
  const insights = useSalesLoyaltyWidgetInsights(config);
  const { topDeals } = insights;

  return (
    <SalesLoyaltyWidgetCard
      title={t('loyalty-insight-top-deals', 'Top deals by points earned')}
      loyaltyEnabled={insights.loyaltyEnabled}
      loading={insights.loading}
      error={insights.error}
      onRetry={insights.refetch}
      isEmpty={!topDeals.length}
    >
      <LoyaltyRankedRows
        rows={topDeals.map(({ dealId, earned }) => ({
          id: dealId,
          value: earned,
        }))}
        renderName={(id) => topDeals.find(({ dealId }) => dealId === id)?.name}
      />
    </SalesLoyaltyWidgetCard>
  );
};

const SalesLoyaltyCustomersWidget = ({
  config,
  kind,
}: TSalesLoyaltyWidgetProps & { kind: 'earners' | 'spenders' }) => {
  const { t } = useTranslation('sales');
  const insights = useSalesLoyaltyWidgetInsights(config);
  const rows = insights[kind];

  return (
    <SalesLoyaltyWidgetCard
      title={
        kind === 'earners'
          ? t('loyalty-insight-top-earners', 'Customers who earned most')
          : t('loyalty-insight-top-spenders', 'Customers who spent most')
      }
      loyaltyEnabled={insights.loyaltyEnabled}
      loading={insights.loading}
      error={insights.error}
      onRetry={insights.refetch}
      isEmpty={!rows.length}
    >
      <LoyaltyRankedRows
        rows={rows}
        renderName={(id) => <CustomersInline customerIds={[id]} />}
      />
    </SalesLoyaltyWidgetCard>
  );
};

export const SalesLoyaltyTopEarnersWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => (
  <SalesLoyaltyCustomersWidget config={config} kind="earners" />
);

export const SalesLoyaltyTopSpendersWidget = ({
  config,
}: TSalesLoyaltyWidgetProps) => (
  <SalesLoyaltyCustomersWidget config={config} kind="spenders" />
);
