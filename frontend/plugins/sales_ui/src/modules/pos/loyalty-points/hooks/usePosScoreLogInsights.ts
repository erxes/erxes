import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { groupLine, rankedRows, summarize } from '@/loyalty-points/summary';
import { SALES_POS_SCORE_LOG_INSIGHTS } from '../graphql';
import { posLoyaltyCountAtom } from '../states';
import { usePosLoyaltyVariables } from './usePosLoyaltyVariables';

/** Loyalty's sums for the orders the page's filters match. */
export const usePosScoreLogInsights = () => {
  const { data, previousData, loading, error, refetch } = useQuery(
    SALES_POS_SCORE_LOG_INSIGHTS,
    { variables: usePosLoyaltyVariables(), fetchPolicy: 'cache-and-network' },
  );

  // A new filter keeps the last figures until the new ones arrive.
  const insights = (data || previousData)?.salesPosScoreLogInsights;
  const topOrders = (insights?.topOrders || []).filter(isDefined);

  const setCount = useSetAtom(posLoyaltyCountAtom);
  const entryCount =
    data && !error ? data.salesPosScoreLogInsights?.entryCount : null;

  // The count beside the filter reads the movements the sums cover.
  useEffect(() => {
    setCount(entryCount ?? null);
  }, [entryCount, setCount]);

  useEffect(() => () => setCount(null), [setCount]);

  return {
    loading: loading && !insights,
    error,
    refetch,
    summary: summarize(insights),
    orderCount: insights?.orderCount ?? 0,
    poses: (insights?.byPos || []).map((line) =>
      groupLine({ ...line, id: line.posId, name: line.posName }),
    ),
    topOrders: topOrders.map((order) => ({
      id: order.orderId,
      name: order.orderNumber
        ? `#${order.orderNumber}${order.posName ? ` · ${order.posName}` : ''}`
        : order.orderId,
      value: order.earned,
    })),
    cashiers: rankedRows(insights?.byCashier, 'earned'),
    branches: rankedRows(insights?.byBranch, 'earned'),
    earners: rankedRows(insights?.topEarners, 'earned'),
    spenders: rankedRows(insights?.topSpenders, 'spent'),
  };
};
