import { OperationVariables, useMutation } from '@apollo/client';
import { BROADCAST_CANCEL_SCHEDULE } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastCancelSchedule = () => {
  const [_cancelSchedule, { loading }] = useMutation(BROADCAST_CANCEL_SCHEDULE);

  const cancelSchedule = async (
    broadcastId: string,
    options?: OperationVariables,
  ) => {
    await _cancelSchedule({
      ...options,
      variables: { _id: broadcastId },
      refetchQueries: [BROADCAST_MESSAGES],
    });
  };

  return { cancelSchedule, loading };
};
