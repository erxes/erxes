import { OperationVariables, useMutation } from '@apollo/client';
import { BROADCAST_SET_PAUSE } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastPause = () => {
  const [_pauseBroadcast, { loading }] = useMutation(BROADCAST_SET_PAUSE);

  const pauseBroadcast = async (
    broadcastId: string,
    options?: OperationVariables,
  ) => {
    await _pauseBroadcast({
      ...options,
      variables: { _id: broadcastId },
      refetchQueries: [BROADCAST_MESSAGES],
    });
  };

  return { pauseBroadcast, loading };
};
