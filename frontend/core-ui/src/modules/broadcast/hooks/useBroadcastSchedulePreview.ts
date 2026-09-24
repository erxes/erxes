import { useQuery } from '@apollo/client';
import { BROADCAST_SCHEDULE_PREVIEW } from '../graphql/queries';
import {
  isRecurringForm,
  isScheduleReady,
  TBroadcastScheduleForm,
  toScheduleVariables,
} from '../utils/scheduleForm';

/**
 * What a repeat would actually do, answered by the scheduler itself.
 *
 * The arithmetic lives on the server, where the alarms are set from it. Asking
 * rather than working it out again here is what keeps the two from drifting
 * apart on a leap year or a month that has no 30th.
 */
export const useBroadcastSchedulePreview = (
  schedule?: TBroadcastScheduleForm | null,
) => {
  const ready = isRecurringForm(schedule) && isScheduleReady(schedule);

  const { data, loading } = useQuery(BROADCAST_SCHEDULE_PREVIEW, {
    variables: ready
      ? toScheduleVariables(schedule as TBroadcastScheduleForm)
      : undefined,
    skip: !ready,
  });

  const preview = data?.engageSchedulePreview;

  return {
    loading,
    count: preview?.count as number | undefined,
    upcoming: (preview?.upcoming || []) as string[],
  };
};
