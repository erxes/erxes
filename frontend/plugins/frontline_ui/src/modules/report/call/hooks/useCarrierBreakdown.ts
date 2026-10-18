import { isDefined } from 'erxes-ui';
import { useQuery } from '@apollo/client';
import { CALL_CARRIER_BREAKDOWN } from '@/integrations/call/graphql/queries/callStatistics';
import { useCallFilters } from './useCallFilters';

export function useCarrierBreakdown() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery(CALL_CARRIER_BREAKDOWN, {
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
    breakdown: data?.callCarrierBreakdown?.filter(isDefined) ?? [],
    loading,
    error,
  };
}
