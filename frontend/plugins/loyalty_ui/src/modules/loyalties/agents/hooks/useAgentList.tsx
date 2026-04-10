import { useQuery } from '@apollo/client';
import { useMemo, useCallback, useEffect } from 'react';
import { IAgent } from '../types/agent';
import { useMultiQueryState, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { agentTotalCountAtom } from '../states/useAgentCounts';
import { AGENTS_QUERY } from '../graphql/queries/queries';

const AGENT_PER_PAGE = 30;

interface UseAgentListReturn {
  loading: boolean;
  agentList: IAgent[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

export const useAgentVariables = () => {
  const [{ agentStatus }] = useMultiQueryState<{ agentStatus: string }>([
    'agentStatus',
  ]);
  const [agentCustomerIds] = useQueryState<string[]>('agentCustomerId');
  const [agentCompanyIds] = useQueryState<string[]>('agentCompanyId');

  return {
    page: 1,
    perPage: AGENT_PER_PAGE,
    status: agentStatus || undefined,
    customerIds:
      agentCustomerIds && agentCustomerIds.length > 0
        ? agentCustomerIds
        : undefined,
    companyIds:
      agentCompanyIds && agentCompanyIds.length > 0
        ? agentCompanyIds
        : undefined,
  };
};

export const useAgentList = (): UseAgentListReturn => {
  const variables = useAgentVariables();
  const setTotalCount = useSetAtom(agentTotalCountAtom);

  const { data, loading, fetchMore } = useQuery(AGENTS_QUERY, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const agentList = useMemo<IAgent[]>(
    () => data?.agentsMain?.list || [],
    [data?.agentsMain?.list],
  );

  const totalCount = useMemo(
    () => data?.agentsMain?.totalCount || 0,
    [data?.agentsMain?.totalCount],
  );

  const pageInfo = useMemo(
    () => ({
      hasNextPage: agentList.length === AGENT_PER_PAGE,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    }),
    [agentList.length],
  );

  const handleFetchMore = useCallback(() => {
    if (!data?.agentsMain || agentList.length < AGENT_PER_PAGE) return;

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(agentList.length / AGENT_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.agentsMain) return prev;
        return {
          agentsMain: {
            ...fetchMoreResult.agentsMain,
            list: [
              ...(prev.agentsMain?.list || []),
              ...(fetchMoreResult.agentsMain.list || []),
            ],
          },
        };
      },
    });
  }, [data, agentList.length, fetchMore, variables]);

  useEffect(() => {
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return { loading, agentList, totalCount, handleFetchMore, pageInfo };
};
