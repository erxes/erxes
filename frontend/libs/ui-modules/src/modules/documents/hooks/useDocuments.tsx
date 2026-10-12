import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  toast,
} from 'erxes-ui';
import { useRef } from 'react';
import { DOCUMENTS_QUERY } from '../graphql/queries';

const DOCUMENTS_PER_PAGE = 20;
export type DocumentTemplate = {
  _id: string;
  name?: string;
  code?: string;
  content?: string | null;
};
type DocumentsResponse = {
  documents: {
    list: DocumentTemplate[];
    totalCount?: number;
    pageInfo?: IRecordTableCursorPageInfo;
  };
};

export const useDocuments = (options?: QueryHookOptions<DocumentsResponse>) => {
  const fetchingMore = useRef(false);
  const { data, loading, fetchMore, error } = useQuery<DocumentsResponse>(
    DOCUMENTS_QUERY,
    {
      ...options,
      notifyOnNetworkStatusChange: true,
      variables: { limit: DOCUMENTS_PER_PAGE, ...options?.variables },
    },
  );
  const { list: documents = [], totalCount, pageInfo } = data?.documents ?? {};

  const handleFetchMore = async (): Promise<void> => {
    if (fetchingMore.current || loading || !pageInfo?.hasNextPage) return;
    fetchingMore.current = true;
    try {
      await fetchMore({
        variables: {
          ...options?.variables,
          cursor: pageInfo.endCursor,
          limit: DOCUMENTS_PER_PAGE,
          direction: EnumCursorDirection.FORWARD,
        },
        updateQuery: (previous, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previous;
          const merged = mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.documents,
            prevResult: previous.documents,
          });
          return {
            ...previous,
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
                previous.documents.totalCount,
            },
          };
        },
      });
    } catch (error) {
      toast({
        title: 'Could not load more documents',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      fetchingMore.current = false;
    }
  };
  return { documents, loading, error, handleFetchMore, totalCount, pageInfo };
};
