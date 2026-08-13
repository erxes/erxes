import { gql, useQuery } from '@apollo/client';
import { CALL_HISTORY_LIST } from '@/integrations/call/graphql/queries/callHistoryList';
import type { CallHistoryEntry, CallHistoryPage } from '../types';
import { useCallFilters } from './useCallFilters';

export const CALL_HISTORY_PAGE_SIZE = 25;

export function useCallHistoryList({
  outcome,
  agentExtension,
  resolution,
  searchValue,
  page,
}: {
  outcome: string;
  agentExtension: string;
  resolution: string;
  searchValue: string;
  page: number;
}) {
  const { startDate, endDate, queueId, direction } = useCallFilters();

  const { data, previousData, loading, error } = useQuery<{
    callHistoryList: CallHistoryPage;
  }>(gql(CALL_HISTORY_LIST), {
    variables: {
      startDate,
      endDate,
      queueId: queueId || undefined,
      direction: direction !== 'all' ? direction : undefined,
      outcome: outcome !== 'all' ? outcome : undefined,
      agentExtension:
        agentExtension !== 'all' ? agentExtension : undefined,
      resolution: resolution !== 'all' ? resolution : undefined,
      searchValue: searchValue || undefined,
      skip: (page - 1) * CALL_HISTORY_PAGE_SIZE,
      limit: CALL_HISTORY_PAGE_SIZE,
    },
    skip: !queueId,
  });

  const result = data?.callHistoryList ?? previousData?.callHistoryList;
  const entries: CallHistoryEntry[] = result?.entries ?? [];

  return {
    entries,
    totalCount: result?.totalCount ?? 0,
    callerCount: result?.callerCount ?? 0,
    agents: result?.agents ?? [],
    loading,

    initialLoading: loading && !result,
    error,
  };
}
