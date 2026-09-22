import { gql, useQuery } from '@apollo/client';
import { CALL_CARRIER_BREAKDOWN } from '@/integrations/call/graphql/queries/callStatistics';
import type { CarrierSlice } from '../types';
import { useCallFilters } from './useCallFilters';

export function useCarrierBreakdown() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery<{
    callCarrierBreakdown: CarrierSlice[];
  }>(gql(CALL_CARRIER_BREAKDOWN), {
    variables: {
      startDate,
      endDate,
      integrationId: integrationId || undefined,
      queueId: queueId && queueId !== 'all' ? queueId : undefined,
      direction: direction !== 'all' ? direction : undefined,
    },
    skip: !integrationId,
  });

  return {
    breakdown: data?.callCarrierBreakdown ?? [],
    loading,
    error,
  };
}
