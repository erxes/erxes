import { useQuery } from '@apollo/client';
import { isDefined, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { dealTotalCountAtom } from '@/deals/states/dealsTotalCountState';
import { useSearchParams } from 'react-router-dom';
import { SALES_DEAL_SCORE_LOG_INSIGHTS } from '../graphql/dealScoreLogsQueries';
import { scopeVariables, TDealScoreLogScope } from './useDealScoreLogs';
import { groupLine, rankedRows, summarize } from '@/loyalty-points/summary';

/** Loyalty's sums for the deals the page's filters match. */
export const useDealScoreLogInsights = (scope: TDealScoreLogScope) => {
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [searchParams] = useSearchParams();

  const { data, previousData, loading, error, refetch } = useQuery(
    SALES_DEAL_SCORE_LOG_INSIGHTS,
    {
      variables: {
        ...scopeVariables(scope, searchParams, pipelineId),
        stageId: searchParams.get('stageId'),
      },
      skip: scope === 'pipeline' && !pipelineId,
      fetchPolicy: 'cache-and-network',
    },
  );

  // A new filter keeps the last figures until the new ones arrive.
  const insights = (data || previousData)?.salesDealScoreLogInsights;
  const setCount = useSetAtom(dealTotalCountAtom);
  const entryCount =
    data && !error ? data.salesDealScoreLogInsights?.entryCount : null;

  // The count beside the filter reads the movements the sums cover.
  useEffect(() => {
    setCount(entryCount ?? null);
  }, [entryCount, setCount]);

  useEffect(() => () => setCount(null), [setCount]);
  const pipelines = (insights?.byPipeline || []).map((line) =>
    groupLine({
      ...line,
      id: line.pipelineId,
      name: line.pipelineName,
      parent: line.boardName,
    }),
  );

  const topDeals = (insights?.topDeals || []).filter(isDefined).map((deal) => ({
    dealId: deal.dealId,
    name: deal.dealName || deal.dealId,
    pipeline: deal.pipelineName || '',
    earned: deal.earned,
  }));

  return {
    loading: loading && !insights,
    error,
    refetch,
    summary: summarize(insights),
    dealCount: insights?.dealCount ?? 0,
    pipelines,
    topDeals,
    assignees: rankedRows(insights?.byAssignee, 'earned'),
    branches: rankedRows(insights?.byBranch, 'earned'),
    earners: rankedRows(insights?.topEarners, 'earned'),
    spenders: rankedRows(insights?.topSpenders, 'spent'),
  };
};
