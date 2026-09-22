import { gql, useQuery } from '@apollo/client';
import { CALL_VOLUME_SERIES } from '@/integrations/call/graphql/queries/callStatistics';
import type { VolumePoint } from '../types';
import { useCallFilters } from './useCallFilters';

export function useVolumeSeries() {
  const { startDate, endDate, integrationId, queueId, direction } =
    useCallFilters();

  const { data, loading, error } = useQuery<{
    callVolumeSeries: VolumePoint[];
  }>(gql(CALL_VOLUME_SERIES), {
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
    series: data?.callVolumeSeries ?? [],
    loading,
    error,
  };
}
