import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import type { IClientPortalFilter } from '~/gql/graphql';
import { GET_CLIENT_PORTALS } from '../graphql/queries';
import { compactList } from '../shared/utils';

export const useClientPortals = (
  filter: IClientPortalFilter = {},
  skip = false,
) => {
  const { data, loading, error, refetch } = useQuery(GET_CLIENT_PORTALS, {
    variables: { filter },
    skip,
  });

  const clientPortals = useMemo(
    () => compactList(data?.getClientPortals?.list),
    [data?.getClientPortals?.list],
  );

  return {
    clientPortals,
    totalCount: data?.getClientPortals?.totalCount || 0,
    pageInfo: data?.getClientPortals?.pageInfo,
    loading,
    error,
    refetch,
  };
};
