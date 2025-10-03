import { QueryHookOptions, useQuery } from '@apollo/client';

import { DOCUMENTS_QUERY } from '../graphql/queries';

import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';

const DOCUMENTS_PER_PAGE = 20;

export const useDocuments = (
  options?: QueryHookOptions<ICursorListResponse<any>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<any>
  >(DOCUMENTS_QUERY, {
    ...options,
    variables: {
      limit: DOCUMENTS_PER_PAGE,
      ...options?.variables,
    },
  });

  const { list: documents, totalCount, pageInfo } = data?.documents ?? {};

  const handleFetchMore = () => {
    if (totalCount && totalCount <= (documents?.length || 0)) return;
    if (!fetchMore) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: DOCUMENTS_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          documents: {
            list: [
              ...(prev.documents?.list || []),
              ...fetchMoreResult.documents.list,
            ],
            totalCount: fetchMoreResult.documents.totalCount,
            pageInfo: fetchMoreResult.documents.pageInfo,
          },
        });
      },
    });
  };

  return {
    documents,
    loading,
    error,
    handleFetchMore,
    totalCount,
  };
};
