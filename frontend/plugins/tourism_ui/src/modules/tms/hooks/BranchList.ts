import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_BRANCH_LIST } from '../graphql/queries';
import type { BmsBranchListQueryVariables } from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export const useBranchList = ({
  limit = 30,
  cursor,
  cursorMode,
  direction,
  orderBy = { createdAt: -1 },
}: BmsBranchListQueryVariables = {}) => {
  const { data, loading, error, refetch } = useQuery(GET_BRANCH_LIST, {
    variables: {
      limit,
      cursor,
      cursorMode,
      direction,
      orderBy,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const rawList = data?.bmsBranchList?.list;
  const list = useMemo(() => compactList(rawList), [rawList]);
  const totalCount = data?.bmsBranchList?.totalCount || 0;
  const pageInfo = data?.bmsBranchList?.pageInfo;

  return { list, totalCount, pageInfo, loading, error, refetch };
};
