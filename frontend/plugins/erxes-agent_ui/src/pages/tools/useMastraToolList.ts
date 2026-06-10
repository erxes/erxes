import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { MASTRA_TOOLS_MAIN } from '~/graphql/queries';

export const TOOLS_PER_PAGE = 30;

export interface IMastraToolRow {
  _id: string;
  toolId: string;
  name: string;
  description?: string;
  type: 'builtin' | 'erxes';
  builtinType?: string;
  erxesPlugin?: string;
  erxesOperation?: string;
  erxesOperationType?: string;
  isEnabled: boolean;
  createdAt: string;
}

/**
 * DB-backed, scroll-paginated tool list for the Tools settings table.
 *
 * Mirrors the erxes Record List pattern: the backend paginates
 * (`mastraToolsMain(page, perPage, …)`) and the table loads the next page when
 * the forward skeleton scrolls into view. `network-only` keeps it fresh — the
 * list reflects creates/edits/deletes without a manual refresh.
 */
export const useMastraToolList = (searchValue?: string) => {
  const variables = {
    page: 1,
    perPage: TOOLS_PER_PAGE,
    searchValue: searchValue || undefined,
  };

  const { data, loading, fetchMore, refetch } = useQuery(MASTRA_TOOLS_MAIN, {
    variables,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });

  const toolsList = useMemo<IMastraToolRow[]>(
    () => data?.mastraToolsMain?.list || [],
    [data?.mastraToolsMain?.list],
  );

  const totalCount = data?.mastraToolsMain?.totalCount ?? 0;

  // Forward-only infinite scroll. `hasNextPage` is derived from totalCount so we
  // never fire an empty extra page.
  const pageInfo = useMemo(
    () => ({
      hasNextPage: toolsList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }),
    [toolsList.length, totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (loading || toolsList.length >= totalCount) return;

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(toolsList.length / TOOLS_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.mastraToolsMain) return prev;
        return {
          mastraToolsMain: {
            ...fetchMoreResult.mastraToolsMain,
            list: [
              ...(prev.mastraToolsMain?.list || []),
              ...(fetchMoreResult.mastraToolsMain.list || []),
            ],
          },
        };
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, toolsList.length, totalCount, fetchMore]);

  return { toolsList, totalCount, loading, pageInfo, handleFetchMore, refetch };
};
