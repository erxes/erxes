import { useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { USER_ACTIVITY_RANKING } from '../graphql';
import { IUserActivityDay, IUserActivityRanking } from '../types';

export const RANKING_PERIODS = [7, 30] as const;
export type TRankingPeriod = (typeof RANKING_PERIODS)[number];

export const useTeamActivityRanking = (days: TRankingPeriod) => {
  const { data, loading, error } = useQuery<{
    userActivityRanking: IUserActivityRanking;
  }>(USER_ACTIVITY_RANKING, {
    variables: {
      days,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    fetchPolicy: 'network-only',
  });

  const ranking = data?.userActivityRanking;

  const { active, inactive, totalMinutes } = useMemo(() => {
    const items = ranking?.items ?? [];

    return {
      active: items.filter((item) => item.activeMinutes > 0),
      // Longest-absent first: those are the ones worth following up on
      inactive: items
        .filter((item) => item.activeMinutes === 0)
        .sort(
          (a, b) =>
            (a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0) -
            (b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0),
        ),
      totalMinutes: items.reduce((sum, item) => sum + item.activeMinutes, 0),
    };
  }, [ranking]);

  // Every local day of the window, zero-filled where nothing was recorded
  const series = useMemo(() => {
    const byDate = new Map(
      (ranking?.series ?? []).map((day) => [day.date, day]),
    );
    const today = dayjs().startOf('day');
    const filled: IUserActivityDay[] = [];

    for (let offset = days - 1; offset >= 0; offset--) {
      const date = today.subtract(offset, 'day').format('YYYY-MM-DD');
      filled.push(byDate.get(date) ?? { date, activeMembers: 0, minutes: 0 });
    }

    return filled;
  }, [ranking, days]);

  return {
    enabled: ranking?.enabled ?? false,
    series,
    memberCount: ranking?.items.length ?? 0,
    active,
    inactive,
    totalMinutes,
    loading,
    error,
  };
};
