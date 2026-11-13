import { useTranslation } from 'react-i18next';
import { BranchesInline, CustomersInline, MembersInline } from 'ui-modules';
import { LoyaltyInsightsView } from '@/loyalty-points/components/LoyaltyInsightsView';
import { useDealScoreLogInsights } from '../hooks/useDealScoreLogInsights';
import { TDealScoreLogScope } from '../hooks/useDealScoreLogs';
import { DealLoyaltyTimeline } from './DealLoyaltyTimeline';

/** Loyalty's sums over the deals the page's filters match. */
export const DealLoyaltyInsights = ({
  scope,
}: {
  scope: TDealScoreLogScope;
}) => {
  const { t } = useTranslation('sales');
  const insights = useDealScoreLogInsights(scope);
  const { topDeals, earners, spenders, assignees, branches } = insights;

  return (
    <LoyaltyInsightsView
      loading={insights.loading}
      error={insights.error}
      refetch={insights.refetch}
      summary={insights.summary}
      records={{
        label: t('loyalty-insight-deals', 'Deals'),
        count: insights.dealCount,
      }}
      timeline={<DealLoyaltyTimeline scope={scope} />}
      groups={{
        title: t('loyalty-insight-by-pipeline', 'Points by pipeline'),
        label: t('pipeline', 'Pipeline'),
        lines: insights.pipelines,
      }}
      rankings={[
        {
          key: 'deals',
          title: t('loyalty-insight-top-deals', 'Top deals by points earned'),
          rows: topDeals.map(({ dealId, earned }) => ({
            id: dealId,
            value: earned,
          })),
          renderName: (id) =>
            topDeals.find(({ dealId }) => dealId === id)?.name,
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
          key: 'assignees',
          title: t('loyalty-insight-by-assignee', 'Points earned by assignee'),
          rows: assignees,
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
