import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { USER_ACTIVITY_SLOTS } from '../graphql';
import { IUserActivitySlots } from '../types';
import { groupActivitySlots } from '../utils/groupActivitySlots';

export const ACTIVITY_DAYS = 30;

export const useMemberActivity = (userId: string) => {
  const { data, loading, error } = useQuery<{
    userActivitySlots: IUserActivitySlots;
  }>(USER_ACTIVITY_SLOTS, {
    variables: { _id: userId, days: ACTIVITY_DAYS },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const result = data?.userActivitySlots;

  const breakdown = useMemo(
    () =>
      result
        ? groupActivitySlots(result.slots, result.slotMinutes, ACTIVITY_DAYS)
        : null,
    [result],
  );

  return { enabled: result?.enabled ?? false, breakdown, loading, error };
};
