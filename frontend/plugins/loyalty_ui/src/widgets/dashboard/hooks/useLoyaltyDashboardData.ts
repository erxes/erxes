import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { COUPONS_QUERY } from '@/loyalties/coupons/graphql/queries/queries';
import { ICoupon } from '@/loyalties/coupons/types/coupon';
import {
  SCORE_LOG_STATISTICS_QUERY,
  SCORE_LOGS_QUERY,
} from '@/loyalties/scores/graphql/queries';
import { ScoreStats } from '@/loyalties/scores/hooks/useScoreStatistics';
import { IScoreLog } from '@/loyalties/scores/types/score';
import { VOUCHERS_QUERY } from '@/loyalties/vouchers/graphql/queries/queries';
import { IVoucher } from '@/loyalties/vouchers/types/voucher';
import {
  LOYALTY_DASHBOARD_LIST_LIMIT,
  TRecentVouchersConfig,
} from '../dashboardWidgetConfig';

const DAY_MS = 24 * 60 * 60 * 1000;

// Start of the day `days` ago, so remounts on the same day share the cache.
const periodStart = (days: number) => {
  if (!days) {
    return undefined;
  }

  const start = new Date(Date.now() - days * DAY_MS);
  start.setHours(0, 0, 0, 0);

  return start.toISOString();
};

export const useScoreSummaryData = (campaignId: string | undefined, days: number) => {
  const fromDate = useMemo(() => periodStart(days), [days]);
  const { data, loading, error, refetch } = useQuery<{
    scoreLogStatistics?: ScoreStats;
  }>(SCORE_LOG_STATISTICS_QUERY, {
    variables: { campaignId: campaignId || undefined, fromDate },
    fetchPolicy: 'cache-and-network',
  });

  return {
    stats: data?.scoreLogStatistics || {},
    loading: loading && !data,
    error,
    refetch: () => refetch(),
  };
};

export const useRecentScoreLogs = (campaignId?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    scoreLogs?: { list: IScoreLog[] };
  }>(SCORE_LOGS_QUERY, {
    variables: {
      campaignId: campaignId || undefined,
      limit: LOYALTY_DASHBOARD_LIST_LIMIT,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    logs: data?.scoreLogs?.list || [],
    loading: loading && !data,
    error,
    refetch: () => refetch(),
  };
};

export const useRecentVouchers = (kind: TRecentVouchersConfig['kind']) => {
  const redeemed = kind === 'redeemed';
  const { data, loading, error, refetch } = useQuery<{
    vouchersMain?: { list: IVoucher[] };
  }>(VOUCHERS_QUERY, {
    variables: {
      page: 1,
      perPage: LOYALTY_DASHBOARD_LIST_LIMIT,
      status: redeemed ? 'used' : undefined,
      sortField: redeemed ? 'usedAt' : 'createdAt',
      sortDirection: -1,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    vouchers: data?.vouchersMain?.list || [],
    loading: loading && !data,
    error,
    refetch: () => refetch(),
  };
};

export const useRecentCoupons = () => {
  const { data, loading, error, refetch } = useQuery<{
    coupons?: { list: ICoupon[] };
  }>(COUPONS_QUERY, {
    variables: {
      limit: LOYALTY_DASHBOARD_LIST_LIMIT,
      sortField: 'createdAt',
      sortDirection: -1,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    coupons: data?.coupons?.list || [],
    loading: loading && !data,
    error,
    refetch: () => refetch(),
  };
};
