import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { MASTRA_AGENTS_MAIN } from '~/graphql/queries';

export const AGENTS_PER_PAGE = 30;

export interface IMastraAgentRow {
  _id: string;
  name: string;
  agentId: string;
  description?: string;
  provider: string;
  model: string;
  toolPolicy?: 'all' | 'custom';
  allowedTools?: string[];
  isEnabled: boolean;
  createdAt: string;
}

interface IMastraAgentsMainResponse {
  mastraAgentsMain: {
    list: IMastraAgentRow[];
    totalCount: number;
  } | null;
}

/**
 * DB-backed, scroll-paginated agent list for the Agents settings table.
 *
 * Same Record List pattern as the Tools table: the backend paginates
 * (`mastraAgentsMain(page, perPage, …)`) and the table loads the next page when
 * the forward skeleton scrolls into view. `network-only` keeps it fresh so the
 * list reflects creates / edits / enable-toggles / deletes without a manual
 * refresh.
 */
export const useMastraAgentList = (searchValue?: string) => {
  const variables = {
    page: 1,
    perPage: AGENTS_PER_PAGE,
    searchValue: searchValue || undefined,
  };

  const { data, loading, fetchMore, refetch } =
    useQuery<IMastraAgentsMainResponse>(MASTRA_AGENTS_MAIN, {
      variables,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'network-only',
    });

  const agentsList = useMemo<IMastraAgentRow[]>(
    () => data?.mastraAgentsMain?.list || [],
    [data?.mastraAgentsMain?.list],
  );

  const totalCount = data?.mastraAgentsMain?.totalCount ?? 0;

  const pageInfo = useMemo(
    () => ({
      hasNextPage: agentsList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }),
    [agentsList.length, totalCount],
  );

  const handleFetchMore = useCallback(() => {
    if (loading || agentsList.length >= totalCount) return;

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(agentsList.length / AGENTS_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.mastraAgentsMain) return prev;
        return {
          mastraAgentsMain: {
            ...fetchMoreResult.mastraAgentsMain,
            list: [
              ...(prev.mastraAgentsMain?.list || []),
              ...(fetchMoreResult.mastraAgentsMain.list || []),
            ],
          },
        };
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, agentsList.length, totalCount, fetchMore]);

  return {
    agentsList,
    totalCount,
    loading,
    pageInfo,
    handleFetchMore,
    refetch,
  };
};
