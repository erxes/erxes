import { ApolloError, NetworkStatus, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { FIELD_GROUPS_QUERY } from '../graphql/fieldsQueries';
import { IFieldGroup } from '../types/fieldsTypes';

const FIELD_GROUPS_PER_PAGE = 100;

export const useFieldGroups = ({
  contentType,
  limit,
}: {
  contentType: string;
  limit?: number;
}) => {
  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery<
    ICursorListResponse<IFieldGroup>
  >(FIELD_GROUPS_QUERY, {
    variables: {
      params: {
        contentType,
        limit: limit ?? FIELD_GROUPS_PER_PAGE,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const list = data?.fieldGroups?.list;
  const pageInfo = data?.fieldGroups?.pageInfo;
  const loadedCount = list?.length || 0;
  const requestedCountRef = useRef<number | null>(null);
  const [pageError, setPageError] = useState<ApolloError | undefined>(
    undefined,
  );

  // Load the remaining pages so consumers get every group of the content type.
  useEffect(() => {
    // Restarted from the first page, so drop the requested page marker.
    if (
      networkStatus === NetworkStatus.refetch ||
      networkStatus === NetworkStatus.setVariables
    ) {
      requestedCountRef.current = null;
      setPageError(undefined);
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
          contentType,
          limit: FIELD_GROUPS_PER_PAGE,
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
          fieldGroups: mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.fieldGroups,
            prevResult: prev.fieldGroups,
          }) as ICursorListResponse<IFieldGroup>['fieldGroups'],
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
    contentType,
  ]);

  return {
    fieldGroups: list || [],
    loading,
    error: error ?? pageError,
    refetch,
  };
};
