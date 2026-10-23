import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { pmsQueries } from '@/pms/graphql/queries';
import type { PmsBranchListQueryVariables } from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export function usePmsBranchList({
  page = 1,
  perPage = 20,
  sortField,
  sortDirection,
}: PmsBranchListQueryVariables = {}) {
  const { data, loading, error, refetch } = useQuery(pmsQueries.PmsBranchList, {
    variables: {
      page,
      perPage,
      sortField,
      sortDirection,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const rawList = data?.pmsBranchList;
  const list = useMemo(() => compactList(rawList), [rawList]);

  return { list, loading, error, refetch };
}
