import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { GET_TOUR_GROUPS } from '../graphql/queries';
import { ITourGroup } from '../types/tour';

type TourGroupsQueryVariables = {
  branchId?: string;
  status?: string;
  date_status?:
    | 'running'
    | 'completed'
    | 'scheduled'
    | 'cancelled'
    | 'unscheduled';
};

export const useTourGroups = (
  options?: QueryHookOptions<
    {
      bmToursGroup: {
        list: ITourGroup[];
        total: number;
      };
    },
    TourGroupsQueryVariables
  >,
) => {
  const [{ status, date_status }] = useMultiQueryState<{
    status: string;
    date_status:
      | 'running'
      | 'completed'
      | 'scheduled'
      | 'cancelled'
      | 'unscheduled';
  }>(['status', 'date_status']);

  const variables: TourGroupsQueryVariables = {
    ...(options?.variables || {}),
    status: status || undefined,
    date_status: date_status || undefined,
  };

  const { data, loading, error, refetch } = useQuery(GET_TOUR_GROUPS, {
    ...options,
    variables,
  });

  return {
    loading,
    error,
    refetch,
    groups: data?.bmToursGroup?.list || [],
    total: data?.bmToursGroup?.total || 0,
  };
};
