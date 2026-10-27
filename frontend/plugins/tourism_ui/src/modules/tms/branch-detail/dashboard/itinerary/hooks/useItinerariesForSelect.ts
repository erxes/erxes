import { NetworkStatus, useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { GET_ITINERARIES } from '../graphql/queries';
import { compactList } from '~/utils/cursorList';

const LIMIT = 20;

interface IUseItinerariesForSelectOptions {
  branchId?: string;
  language?: string;
  search?: string;
}

export const useItinerariesForSelect = ({
  branchId,
  language,
  search,
}: IUseItinerariesForSelectOptions) => {
  const { data, loading, fetchMore, networkStatus } = useQuery(
    GET_ITINERARIES,
    {
      variables: {
        branchId,
        language,
        name: search || undefined,
        limit: LIMIT,
        orderBy: { createdAt: -1 },
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const isInitialLoading =
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.setVariables;

  const list = data?.bmsItineraries?.list;
  const itineraries = useMemo(() => compactList(list), [list]);
  const totalCount = data?.bmsItineraries?.totalCount ?? 0;
  const pageInfo = data?.bmsItineraries?.pageInfo;

  const handleFetchMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || loading) return;

    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
        limit: LIMIT,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.bmsItineraries) return prev;
        return {
          ...prev,
          bmsItineraries: {
            ...fetchMoreResult.bmsItineraries,
            list: [
              ...(prev.bmsItineraries?.list ?? []),
              ...(fetchMoreResult.bmsItineraries.list ?? []),
            ],
          },
        };
      },
    });
  }, [fetchMore, pageInfo, loading]);

  return {
    itineraries,
    isInitialLoading,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
