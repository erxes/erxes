import { ApolloError, NetworkStatus, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
} from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { FIELDS_QUERY } from '../graphql/fieldsQueries';
import { IField } from '../types/fieldsTypes';

const FIELDS_PER_PAGE = 100;

export const useFields = ({
  groupId,
  contentType,
  limit,
}: {
  groupId?: string;
  contentType: string;
  limit?: number;
}) => {
  const { data, loading, error, refetch, fetchMore, networkStatus } = useQuery<
    ICursorListResponse<IField>
  >(FIELDS_QUERY, {
    variables: {
      params: {
        groupId,
        contentType,
        limit: limit ?? FIELDS_PER_PAGE,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const list = data?.fields?.list;
  const pageInfo = data?.fields?.pageInfo;
  const loadedCount = list?.length || 0;
  const requestedCountRef = useRef<number | null>(null);
  const [pageError, setPageError] = useState<ApolloError | undefined>(
    undefined,
  );

  // Load the remaining pages so consumers get the whole field list.
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
          groupId,
          contentType,
          limit: FIELDS_PER_PAGE,
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
          fields: mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.fields,
            prevResult: prev.fields,
          }) as ICursorListResponse<IField>['fields'],
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
    groupId,
    contentType,
  ]);

  const fields = (list || []).map((field) => {
    const type = field.type?.startsWith('relation:') ? 'relation' : field.type;
    const relationType =
      type === 'relation' ? field.type?.replace('relation:', '') : undefined;

    const isLogicRules = Array.isArray(field.logics);

    const logics = isLogicRules
      ? field.logics
      : Object.fromEntries(
          Object.entries(field.logics || {}).filter(
            ([key]) => key !== 'multiple',
          ),
        );

    const multiple = isLogicRules
      ? undefined
      : (field.logics as { multiple?: boolean } | undefined)?.multiple;

    return {
      ...field,
      type,
      relationType,
      logics,
      multiple,
    };
  });

  return {
    fields: fields,
    totalCount: data?.fields?.totalCount || 0,
    loading,
    error: error ?? pageError,
    refetch,
  };
};
