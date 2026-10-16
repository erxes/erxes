import { readCurrencyAmounts } from '@/deals/utils/dealJson';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { useOrdersVariables } from '../../hooks/UseOrderList';
import { POS_ORDERS_SUMMARY_QUERY } from '../graphql/queries/posOrdersSummaryQuery';

export const usePosOrdersSummary = (
  options: Parameters<typeof useOrdersVariables>[0] = {},
) => {
  const variables = useOrdersVariables(options);

  const { data, loading } = useQuery(POS_ORDERS_SUMMARY_QUERY, {
    variables,
  });

  const posOrdersSummary = useMemo(
    () =>
      data?.posOrdersSummary == null
        ? undefined
        : readCurrencyAmounts(data.posOrdersSummary),
    [data?.posOrdersSummary],
  );

  return {
    posOrdersSummary,
    loading,
  };
};
