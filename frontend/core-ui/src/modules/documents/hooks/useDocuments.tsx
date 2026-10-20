import { useTranslation } from 'react-i18next';
import { NetworkStatus, QueryResult, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  validateFetchMore,
  toast,
} from 'erxes-ui';
import { useRef } from 'react';
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

export const useDocuments = (): Pick<
  QueryResult<DocumentsQueryResponse>,
  'loading' | 'refetch'
> & {
  documents: IDocument[];
  hasError: boolean;
  pageInfo: IRecordTableCursorPageInfo | undefined;
  totalCount: number | undefined;
  handleFetchMore: (options: {
    direction: EnumCursorDirection;
  }) => Promise<void>;
} => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const fetchingMore = useRef(false);
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

  const { data, error, loading, fetchMore, networkStatus, refetch } =
    useQuery<DocumentsQueryResponse>(GET_DOCUMENTS, {
      notifyOnNetworkStatusChange: true,
      variables,
    });

  const { list: documents = [], pageInfo, totalCount } = data?.documents || {};
  const hasError = Boolean(error || networkStatus === NetworkStatus.error);

  async function handleFetchMore({
    direction,
  }: {
    direction: EnumCursorDirection;
  }): Promise<void> {
    if (
      fetchingMore.current ||
      loading ||
      !pageInfo ||
      !validateFetchMore({ direction, pageInfo })
    ) {
      return;
    }

    fetchingMore.current = true;
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
          if (!fetchMoreResult) {
            return previousResult;
          }

          const merged = mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.documents,
            prevResult: previousResult.documents,
          });
          return {
            ...previousResult,
            documents: {
              ...merged,
              list: Array.from(
                new Map(
                  (merged.list || []).map((document) => [
                    document._id,
                    document,
                  ]),
                ).values(),
              ),
              totalCount:
                fetchMoreResult.documents.totalCount ??
                previousResult.documents.totalCount,
            },
          };
        },
      });
    } catch (error) {
      toast({
        title: t('load-more-error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      fetchingMore.current = false;
    }
  }

  return {
    documents,
    hasError,
    loading,
    pageInfo,
    totalCount,
    handleFetchMore,
    refetch,
  };
};
