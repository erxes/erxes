import { useQuery } from '@apollo/client';
import { isEnabled } from 'erxes-ui';
import { SALES_DEAL_LOYALTY_TOTALS } from '../graphql/loyaltyRulesQueries';

/** Net points per deal for the deals the list has loaded; none without loyalty. */
export const useDealLoyaltyTotals = (dealIds: string[]) => {
  const enabled = isEnabled('loyalty');
  // Sorted so the same page asks the same question whatever its order.
  const targetIds = [...new Set(dealIds)].sort();
  const { data, previousData, loading } = useQuery<{
    loyaltyScoreTargetTotals?: { targetId: string; total: number }[];
  }>(SALES_DEAL_LOYALTY_TOTALS, {
    variables: { targetIds },
    skip: !enabled || !targetIds.length,
    fetchPolicy: 'cache-and-network',
  });
  // A board asks again as each column loads; the last answer stays shown.
  const shown = data || previousData;
  const totals = new Map(
    (shown?.loyaltyScoreTargetTotals || []).map(({ targetId, total }) => [
      targetId,
      total,
    ]),
  );

  return {
    enabled,
    loading: loading && !shown,
    // A deal that moved no points has no line, which reads as zero.
    totalOf: (dealId: string) => totals.get(dealId) ?? 0,
  };
};
