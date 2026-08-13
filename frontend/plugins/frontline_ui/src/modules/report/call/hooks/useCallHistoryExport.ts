import { gql, useLazyQuery } from '@apollo/client';
import { CALL_HISTORY_LIST } from '@/integrations/call/graphql/queries/callHistoryList';
import type { CallHistoryPage } from '../types';
import { useCallFilters } from './useCallFilters';
import { CALL_HISTORY_EXPORT_LIMIT } from '../callHistoryCsv';

export function useCallHistoryExport({
  outcome,
  agentExtension,
  resolution,
  searchValue,
}: {
  outcome: string;
  agentExtension: string;
  resolution: string;
  searchValue: string;
}) {
  const { startDate, endDate, queueId, direction } = useCallFilters();

  const [fetchAll, { loading }] = useLazyQuery<{
    callHistoryList: CallHistoryPage;
  }>(gql(CALL_HISTORY_LIST), { fetchPolicy: 'network-only' });

  const loadForExport = async () => {
    const { data } = await fetchAll({
      variables: {
        startDate,
        endDate,
        queueId: queueId || undefined,
        direction: direction !== 'all' ? direction : undefined,
        outcome: outcome !== 'all' ? outcome : undefined,
        agentExtension: agentExtension !== 'all' ? agentExtension : undefined,
        resolution: resolution !== 'all' ? resolution : undefined,
        searchValue: searchValue || undefined,
        skip: 0,
        limit: CALL_HISTORY_EXPORT_LIMIT,
      },
    });

    return data?.callHistoryList?.entries ?? [];
  };

  return { loadForExport, loading };
}
