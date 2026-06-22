import { MASTRA_SCHEDULES } from '~/graphql/queries';
import { useResourceList } from '~/components/useResourceList';
import { ISchedule, ISchedulesQueryResponse } from '../types';

/** All schedules for the list page. Network-only so the table reflects edits. */
export const useSchedules = () => {
  const { items, loading, refetch } = useResourceList<
    ISchedulesQueryResponse,
    ISchedule
  >(MASTRA_SCHEDULES, (data) => data?.mastraSchedules ?? []);

  return { schedules: items, loading, refetch };
};
