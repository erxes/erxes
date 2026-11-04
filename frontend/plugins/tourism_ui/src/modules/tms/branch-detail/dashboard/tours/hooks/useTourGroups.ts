import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { GET_TOUR_GROUPS } from '../graphql/queries';
import type {
  BmToursGroupQuery,
  BmToursGroupQueryVariables,
  Date_Status,
} from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export const useTourGroups = (
  options?: QueryHookOptions<BmToursGroupQuery, BmToursGroupQueryVariables>,
) => {
  const [{ status, date_status, categoryIds }] = useMultiQueryState<{
    status: string;
    date_status: Date_Status;
    categoryIds: string;
  }>(['status', 'date_status', 'categoryIds']);

  const variables: BmToursGroupQueryVariables = {
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

  const list = data?.bmToursGroup?.list;
  const groups = useMemo(() => compactList(list), [list]);

  return {
    loading,
    error,
    refetch,
    groups,
    total: data?.bmToursGroup?.total || 0,
  };
};
