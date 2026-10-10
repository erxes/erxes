import { NetworkStatus, QueryResult, useQuery } from '@apollo/client';
import { useRef, useState } from 'react';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { GET_DOCUMENTS } from '../graphql/queries';
import { DocumentFilterState, IDocument } from '../types';

const DOCUMENTS_PER_PAGE = 20;

type DocumentsQueryResponse = {
  documents: {
    list?: IDocument[];
    pageInfo?: IRecordTableCursorPageInfo;
    totalCount?: number;
  };
};

type UseDocumentsResult = {
  documents: IDocument[];
  hasError: boolean;
  loading: boolean;
  totalCount?: number;
  pageInfo?: IRecordTableCursorPageInfo;
  handleFetchMore: (params: {
    direction: EnumCursorDirection;
  }) => Promise<void>;
  refetch: QueryResult<DocumentsQueryResponse>['refetch'];
};

export const useDocuments = (): UseDocumentsResult => {
  const fetchingMore = useRef(new Set<string>());
  const [paginationError, setPaginationError] = useState<string>();
  const [{ createdAt, createdBy, contentType, searchValue, tagIds }] =
    useMultiQueryState<DocumentFilterState>([
      'createdAt',
      'createdBy',
      'contentType',
      'searchValue',
      'tagIds',
    ]);

  const variables: Record<string, unknown> = {
    limit: DOCUMENTS_PER_PAGE,
    orderBy: { createdAt: -1 },
  };

  if (tagIds?.length) {
    variables.tagIds = tagIds;
  }

  if (contentType) {
    variables['contentType'] = contentType;
  }

  if (searchValue) {
    variables['searchValue'] = searchValue;
  }

  if (createdBy) {
    variables['userIds'] = createdBy;
  }

  if (createdAt) {
    variables['dateFilters'] = JSON.stringify({
      createdAt: {
        gte: parseDateRangeFromString(createdAt)?.from,
        lte: parseDateRangeFromString(createdAt)?.to,
      },
    });
  }

  const queryKey = JSON.stringify(variables);
  const currentQueryKey = useRef(queryKey);
  currentQueryKey.current = queryKey;

  const { data, error, loading, fetchMore, networkStatus, refetch } =
    useQuery<DocumentsQueryResponse>(GET_DOCUMENTS, {
      notifyOnNetworkStatusChange: true,
      variables,
    });

  const { list: documents = [], pageInfo, totalCount } = data?.documents || {};
  const hasError = Boolean(
    error ||
      networkStatus === NetworkStatus.error ||
      paginationError === queryKey,
  );

  async function handleFetchMore({
    direction,
  }: {
    direction: EnumCursorDirection;
  }): Promise<void> {
    if (
      fetchingMore.current.has(queryKey) ||
      loading ||
      !pageInfo ||
      !validateFetchMore({ direction, pageInfo })
    ) {
      return;
    }

    fetchingMore.current.add(queryKey);

    try {
      await fetchMore({
        variables: {
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo.endCursor
              : pageInfo.startCursor,
          direction,
          limit: DOCUMENTS_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || currentQueryKey.current !== queryKey) {
            return previousResult;
          }

          return {
            ...previousResult,
            documents: mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.documents,
              prevResult: previousResult.documents,
            }),
          };
        },
      });
    } catch {
      if (currentQueryKey.current === queryKey) {
        setPaginationError(queryKey);
      }
    } finally {
      fetchingMore.current.delete(queryKey);
    }
  }

  const refetchDocuments: typeof refetch = (...args) => {
    setPaginationError(undefined);
    return refetch(...args);
  };

  return {
    documents,
    hasError,
    loading,
    totalCount,
    pageInfo,
    handleFetchMore,
    refetch: refetchDocuments,
  };
};
