import { useTranslation } from 'react-i18next';
import { BranchesInline, CustomersInline, MembersInline } from 'ui-modules';
import { LoyaltyInsightsView } from '@/loyalty-points/components/LoyaltyInsightsView';
import { LoyaltyTimelineView } from '@/loyalty-points/components/LoyaltyTimelineView';
import { usePosScoreLogInsights } from '../hooks/usePosScoreLogInsights';
import { usePosScoreLogTimeline } from '../hooks/usePosScoreLogTimeline';

const PosLoyaltyTimeline = () => (
  <LoyaltyTimelineView {...usePosScoreLogTimeline()} />
);

/** Loyalty's sums over the POS orders the page's filters match. */
export const PosLoyaltyInsights = () => {
  const { t } = useTranslation('sales');
  const insights = usePosScoreLogInsights();
  const { topOrders, earners, spenders, cashiers, branches } = insights;

  return (
    <LoyaltyInsightsView
      loading={insights.loading}
      error={insights.error}
      refetch={insights.refetch}
      summary={insights.summary}
      records={{
        label: t('loyalty-insight-orders', 'Orders'),
        count: insights.orderCount,
      }}
      timeline={<PosLoyaltyTimeline />}
      groups={{
        title: t('loyalty-insight-by-pos', 'Points by POS'),
        label: t('pos'),
        lines: insights.poses,
      }}
      rankings={[
        {
          key: 'orders',
          title: t('loyalty-insight-top-orders', 'Top orders by points earned'),
          rows: topOrders,
          renderName: (id) => topOrders.find((order) => order.id === id)?.name,
          drillBy: 'recordId',
        },
        {
          key: 'earners',
          title: t('loyalty-insight-top-earners', 'Customers who earned most'),
          rows: earners,
          renderName: (id) => <CustomersInline customerIds={[id]} />,
          drillBy: 'customerId',
        },
        {
          key: 'spenders',
          title: t('loyalty-insight-top-spenders', 'Customers who spent most'),
          rows: spenders,
          renderName: (id) => <CustomersInline customerIds={[id]} />,
          drillBy: 'customerId',
        },
        {
          key: 'cashiers',
          title: t('loyalty-insight-by-cashier', 'Points earned by cashier'),
          rows: cashiers,
          renderName: (id) => <MembersInline memberIds={[id]} size="sm" />,
          drillBy: 'personId',
        },
        {
          key: 'branches',
          title: t('loyalty-insight-by-branch', 'Points earned by branch'),
          rows: branches,
          renderName: (id) => <BranchesInline branchIds={[id]} />,
          drillBy: 'branchId',
        },
      ]}
    />
  );
};
