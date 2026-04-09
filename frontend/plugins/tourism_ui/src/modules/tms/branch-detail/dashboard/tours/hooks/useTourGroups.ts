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
  categoryIds?: string[];
  language?: string;
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
  const [{ status, date_status, categoryIds }] = useMultiQueryState<{
    status: string;
    date_status:
      | 'running'
      | 'completed'
      | 'scheduled'
      | 'cancelled'
      | 'unscheduled';
    categoryIds: string;
  }>(['status', 'date_status', 'categoryIds']);

  const variables: TourGroupsQueryVariables = {
    ...(options?.variables || {}),
    status: status || undefined,
    date_status: date_status || undefined,
    categoryIds: categoryIds
      ? categoryIds.split(',').filter(Boolean)
      : undefined,
  };

  const { data, loading, error, refetch } = useQuery(GET_TOUR_GROUPS, {
    ...options,
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {
    loading,
    error,
    refetch,
    groups: data?.bmToursGroup?.list || [],
    total: data?.bmToursGroup?.total || 0,
  };
};
