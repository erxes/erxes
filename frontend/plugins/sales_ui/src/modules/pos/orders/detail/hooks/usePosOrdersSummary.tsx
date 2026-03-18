import { POS_ORDERS_SUMMARY_QUERY } from '../graphql/queries/posOrdersSummaryQuery';
import { useQuery } from '@apollo/client';
import { useOrdersVariables } from '../../hooks/UseOrderList';

export const usePosOrdersSummary = (options: any = {}) => {
  const variables = useOrdersVariables(options);

  const { data, loading } = useQuery(POS_ORDERS_SUMMARY_QUERY, {
    variables,
  });

  return {
    posOrdersSummary: data?.posOrdersSummary,
    loading,
  };
};
