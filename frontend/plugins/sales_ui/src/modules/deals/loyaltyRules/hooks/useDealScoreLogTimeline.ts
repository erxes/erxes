import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SalesDealScoreLogTimelineQueryVariables } from '~/gql/graphql';
import { SALES_DEAL_SCORE_LOG_TIMELINE } from '../graphql/dealScoreLogsQueries';
import { scopeVariables, TDealScoreLogScope } from './useDealScoreLogs';
import {
  isQuiet,
  toPeriods,
  TTimelineInterval,
} from '@/loyalty-points/summary';

type TTimelineFilters = Omit<
  SalesDealScoreLogTimelineQueryVariables,
  'interval' | 'timezone'
>;

/** Loyalty's sums per period, in the viewer's zone, for the given deals. */
export const useDealScoreLogTimelineQuery = (
  filters: TTimelineFilters,
  interval: TTimelineInterval,
  skip = false,
) => {
  const { data, previousData, loading, error, refetch } = useQuery(
    SALES_DEAL_SCORE_LOG_TIMELINE,
    {
      variables: {
        ...filters,
        interval,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      skip,
      fetchPolicy: 'cache-and-network',
    },
  );

  // A new filter or period keeps the last figures until the new ones arrive.
  const timeline = (data || previousData)?.salesDealScoreLogTimeline;
  const periods = toPeriods(timeline?.buckets, timeline?.interval || interval);

  return {
    loading: loading && !timeline,
    error,
    refetch,
    periods,
    isEmpty: isQuiet(periods),
  };
};

/** Loyalty's sums per period for the deals the page's filters match. */
export const useDealScoreLogTimeline = (scope: TDealScoreLogScope) => {
  const [interval, setPeriodInterval] = useState<TTimelineInterval>('week');
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [searchParams] = useSearchParams();

  const timeline = useDealScoreLogTimelineQuery(
    {
      ...scopeVariables(scope, searchParams, pipelineId),
      stageId: searchParams.get('stageId'),
    },
    interval,
    scope === 'pipeline' && !pipelineId,
  );

  return { interval, changeInterval: setPeriodInterval, ...timeline };
};
