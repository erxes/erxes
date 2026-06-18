import { useQuery } from '@apollo/client';
import { MASTRA_SCHEDULES } from '~/graphql/queries';
import { ISchedule, ISchedulesQueryResponse } from '../types';

/** All schedules for the list page. Network-only so the table reflects edits. */
export const useSchedules = () => {
  const { data, loading, refetch } = useQuery<ISchedulesQueryResponse>(
    MASTRA_SCHEDULES,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const schedules: ISchedule[] = data?.mastraSchedules ?? [];

  return { schedules, loading, refetch };
};
