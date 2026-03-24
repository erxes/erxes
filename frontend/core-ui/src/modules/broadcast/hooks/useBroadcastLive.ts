import { OperationVariables, useMutation } from '@apollo/client';
import { BROADCAST_SET_LIVE } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastLive = () => {
  const [_setBroadcastLive, { loading }] = useMutation(BROADCAST_SET_LIVE);

  const setBroadcastLive = async (
    broadcastId: string,
    options?: OperationVariables,
  ) => {
    await _setBroadcastLive({
      ...options,
      variables: { _id: broadcastId },
      refetchQueries: [BROADCAST_MESSAGES],
    });
  };

  return { setBroadcastLive, loading };
};
