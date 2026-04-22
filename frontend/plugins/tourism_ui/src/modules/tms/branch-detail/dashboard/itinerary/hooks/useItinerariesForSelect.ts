import { NetworkStatus, useQuery } from '@apollo/client';
import { useCallback } from 'react';
import { GET_ITINERARIES } from '../graphql/queries';
import { IItinerary } from '../types/itinerary';

const LIMIT = 20;

interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface IItinerariesData {
  bmsItineraries: {
    list: IItinerary[];
    totalCount: number;
    pageInfo: IPageInfo;
  };
}

interface UseItinerariesForSelectOptions {
  branchId?: string;
  language?: string;
  search?: string;
}

export const useItinerariesForSelect = ({
  branchId,
  language,
  search,
}: UseItinerariesForSelectOptions) => {
  const { data, loading, fetchMore, networkStatus } =
    useQuery<IItinerariesData>(GET_ITINERARIES, {
      variables: {
        branchId,
        language,
        name: search || undefined,
        limit: LIMIT,
        orderBy: { createdAt: -1 },
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  const isInitialLoading =
    networkStatus === NetworkStatus.loading ||
    networkStatus === NetworkStatus.setVariables;

  const {
    list: itineraries = [],
    totalCount = 0,
    pageInfo,
  } = data?.bmsItineraries || {};

  const handleFetchMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || loading) return;

    fetchMore({
      variables: {
        cursor: pageInfo.endCursor,
        limit: LIMIT,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          bmsItineraries: {
            ...fetchMoreResult.bmsItineraries,
            list: [
              ...(prev.bmsItineraries?.list ?? []),
              ...fetchMoreResult.bmsItineraries.list,
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
