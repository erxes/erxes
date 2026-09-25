import { OperationVariables, useMutation } from '@apollo/client';
import { BROADCAST_SET_SCHEDULE } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';
import {
  TBroadcastScheduleForm,
  toScheduleVariables,
} from '../utils/scheduleForm';

export const useBroadcastSchedule = () => {
  const [_setSchedule, { loading }] = useMutation(BROADCAST_SET_SCHEDULE);

  const setSchedule = async (
    broadcastId: string,
    schedule: TBroadcastScheduleForm,
    options?: OperationVariables,
  ) => {
    await _setSchedule({
      ...options,
      variables: { _id: broadcastId, ...toScheduleVariables(schedule) },
      refetchQueries: [BROADCAST_MESSAGES],
    });
  };

  return { setSchedule, loading };
};
