import { useQuery } from '@apollo/client';
import { isDefined, useQueryState } from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { dealTotalCountAtom } from '@/deals/states/dealsTotalCountState';
import { getDealsQueryVariables } from '@/deals/utils/queryVariables';
import {
  TScoreLogEntry,
  useScoreLogsByIds,
} from '@/loyalty-points/hooks/useScoreLogsByIds';
import { drillPeriod, useLoyaltyDrill } from '@/loyalty-points/drill';
import { SALES_DEAL_SCORE_LOGS } from '../graphql/dealScoreLogsQueries';

const PER_PAGE = 50;

export type TDealScoreLogRow = {
  // The entry's own id; one entry belongs to one deal.
  _id: string;
  dealId: string;
  dealName?: string | null;
  stageId?: string | null;
  stageName?: string | null;
  pipelineName?: string | null;
  boardName?: string | null;
  scoreLogId: string;
  log?: TScoreLogEntry;
};

// `pipeline`: the deals page's pipeline; `all`: every pipeline the user may
// see, narrowed by the page's own board and pipeline filters.
export type TDealScoreLogScope = 'pipeline' | 'all';

const asList = (value: unknown) =>
  Array.isArray(value) ? value : value ? [value] : undefined;

export const scopeVariables = (
  scope: TDealScoreLogScope,
  searchParams: URLSearchParams,
  pipelineId: string | null,
) => {
  const { board, pipeline, ...vars } = getDealsQueryVariables(searchParams, {
    includeArchivedMode: false,
  });

  if (scope === 'pipeline') {
    return { ...vars, pipelineId };
  }

  return { ...vars, boardIds: asList(board), pipelineIds: asList(pipeline) };
};

export const useDealScoreLogs = (scope: TDealScoreLogScope = 'pipeline') => {
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [searchParams] = useSearchParams();
  const drillContext = useLoyaltyDrill();
  const drill = drillContext?.drill;
  // The opened sum narrows the page's filters.
  const drilled = {
    ...(drill?.groupId ? { pipelineIds: [drill.groupId] } : {}),
    ...(drill?.customerId ? { customerId: drill.customerId } : {}),
    ...(drill?.personId ? { assignedUserIds: [drill.personId] } : {}),
    ...(drill?.branchId ? { branchIds: [drill.branchId] } : {}),
    ...(drill?.recordId ? { _ids: [drill.recordId] } : {}),
    kind: drill?.kind,
    period: drillPeriod(drill),
  };
  const variables = {
    ...scopeVariables(scope, searchParams, pipelineId),
    stageId: searchParams.get('stageId'),
    ...drilled,
    page: 1,
    perPage: PER_PAGE,
  };

  const { data, loading, error, fetchMore, refetch } = useQuery(
    SALES_DEAL_SCORE_LOGS,
    {
      variables,
      skip: scope === 'pipeline' && !pipelineId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  const entries = useMemo(
    () => data?.salesDealScoreLogs?.list?.filter(isDefined) || [],
    [data],
  );
  const totalCount = data?.salesDealScoreLogs?.totalCount || 0;
  const scoreLogs = useScoreLogsByIds(entries.map((e) => e.scoreLogId));
  const setTotalCount = useSetAtom(dealTotalCountAtom);
  // On the loyalty page the sums count; in the deals' Points view the list.
  const counts = !drillContext;
  const counted = counts && !!data && !error;

  // The count beside the filter reads movements here, not deals.
  useEffect(() => {
    if (counts) {
      setTotalCount(counted ? totalCount : null);
    }
  }, [counts, counted, totalCount, setTotalCount]);

  useEffect(
    () => () => {
      if (counts) {
        setTotalCount(null);
      }
    },
    [counts, setTotalCount],
  );

  const rows: TDealScoreLogRow[] = entries.map((entry) => ({
    ...entry,
    _id: entry.scoreLogId,
    log: scoreLogs.logs.get(entry.scoreLogId),
  }));

  const handleFetchMore = () => {
    if (loading || entries.length >= totalCount) {
      return;
    }

    fetchMore({
      variables: { page: Math.floor(entries.length / PER_PAGE) + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.salesDealScoreLogs) {
          return prev;
        }

        return {
          salesDealScoreLogs: {
            ...fetchMoreResult.salesDealScoreLogs,
            list: [
              ...(prev.salesDealScoreLogs?.list || []),
              ...(fetchMoreResult.salesDealScoreLogs.list || []),
            ],
          },
        };
      },
    });
  };

  const retry = () => {
    scoreLogs.reset();
    refetch();
  };

  return {
    rows,
    totalCount,
    loading: loading && !entries.length,
    logsLoading: scoreLogs.loading,
    error: error || scoreLogs.error,
    hasNextPage: entries.length < totalCount,
    handleFetchMore,
    retry,
  };
};
