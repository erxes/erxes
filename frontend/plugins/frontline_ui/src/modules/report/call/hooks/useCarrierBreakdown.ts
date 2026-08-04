import { gql, useQuery } from '@apollo/client';
import { CALL_CARRIER_BREAKDOWN } from '@/integrations/call/graphql/queries/callStatistics';
import type { CarrierSlice } from '../types';
import { useCallFilters } from './useCallFilters';

export function useCarrierBreakdown() {
  const { startDate, endDate, queueId, direction } = useCallFilters();

  const { data, loading, error } = useQuery<{
    callCarrierBreakdown: CarrierSlice[];
  }>(gql(CALL_CARRIER_BREAKDOWN), {
    variables: {
      startDate,
      endDate,
      queueId: queueId || undefined,
      direction: direction !== 'all' ? direction : undefined,
    },
    skip: !queueId,
  });

  return {
    breakdown: data?.callCarrierBreakdown ?? [],
    loading,
    error,
  };
}
