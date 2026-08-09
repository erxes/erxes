import { ApolloError, NetworkStatus, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
} from 'erxes-ui';
import { DocumentNode } from 'graphql';
import { useEffect, useRef, useState } from 'react';

// Loads the first page through `useQuery`, then keeps requesting the next one
// until the cursor is exhausted, so consumers always receive the whole list.
// Passing `limit` opts out and keeps the single requested page.
export const useAllCursorPages = <T>({
  query,
  responseKey,
  params,
  perPage,
  limit,
}: {
  query: DocumentNode;
  responseKey: string;
  params: Record<string, unknown>;
  perPage: number;
  limit?: number;
}) => {
  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery<
    ICursorListResponse<T>
  >(query, {
    variables: {
      params: {
        ...params,
        limit: limit ?? perPage,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const list = data?.[responseKey]?.list;
  const pageInfo = data?.[responseKey]?.pageInfo;
  const loadedCount = list?.length || 0;
  const requestedCountRef = useRef<number | null>(null);
  const [pageError, setPageError] = useState<ApolloError | null>(null);

  // Callers build `params` inline, so depend on its contents rather than the
  // object identity and read the latest value through a ref.
  const paramsKey = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useEffect(() => {
    // Restarted from the first page, so drop the requested page marker.
    if (
      networkStatus === NetworkStatus.refetch ||
      networkStatus === NetworkStatus.setVariables
    ) {
      requestedCountRef.current = null;
      setPageError(null);
      return;
    }

    if (limit || loading || !pageInfo?.hasNextPage) {
      return;
    }

    if (requestedCountRef.current === loadedCount) {
      return;
    }

    requestedCountRef.current = loadedCount;

    fetchMore({
      variables: {
        params: {
          ...paramsRef.current,
          limit: perPage,
          cursor: pageInfo.endCursor,
          direction: EnumCursorDirection.FORWARD,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          ...prev,
          // `mergeCursorData` widens `totalCount` and the cursors to optional,
          // while the merged page keeps the shape the query returned.
          [responseKey]: mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult[responseKey],
            prevResult: prev[responseKey],
          }) as ICursorListResponse<T>[string],
        };
      },
      // Auto-pagination stops on the failed page instead of retrying in a
      // loop; `refetch` restarts from the first page and clears the error.
    }).catch((fetchMoreError: ApolloError) => setPageError(fetchMoreError));
  }, [
    networkStatus,
    limit,
    loading,
    loadedCount,
    pageInfo?.hasNextPage,
    pageInfo?.endCursor,
    fetchMore,
    paramsKey,
    perPage,
    responseKey,
  ]);

  return {
    list: list || [],
    totalCount: data?.[responseKey]?.totalCount || 0,
    loading,
    error: error ?? pageError ?? undefined,
    refetch,
  };
};
