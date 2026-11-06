import { useQuery } from '@apollo/client';
import { useState } from 'react';
import {
  isQuiet,
  toPeriods,
  TTimelineInterval,
} from '@/loyalty-points/summary';
import { SALES_POS_SCORE_LOG_TIMELINE } from '../graphql';
import { usePosLoyaltyVariables } from './usePosLoyaltyVariables';

/** Loyalty's sums per period for the orders the page's filters match. */
export const usePosScoreLogTimeline = () => {
  const [interval, setPeriodInterval] = useState<TTimelineInterval>('week');
  const { data, previousData, loading, error, refetch } = useQuery(
    SALES_POS_SCORE_LOG_TIMELINE,
    {
      variables: {
        ...usePosLoyaltyVariables(),
        interval,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  // A new filter or period keeps the last figures until the new ones arrive.
  const timeline = (data || previousData)?.salesPosScoreLogTimeline;
  const periods = toPeriods(timeline?.buckets, timeline?.interval || interval);

  return {
    interval,
    changeInterval: setPeriodInterval,
    loading: loading && !timeline,
    error,
    refetch,
    periods,
    isEmpty: isQuiet(periods),
  };
};
