import { OperationVariables, useMutation } from '@apollo/client';
import { BROADCAST_COPY } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastCopy = () => {
  const [_copyBroadcast, { loading }] = useMutation(BROADCAST_COPY);

  const copyBroadcast = async (
    broadcastId: string,
    options?: OperationVariables,
  ) => {
    await _copyBroadcast({
      ...options,
      variables: { _id: broadcastId },
      refetchQueries: [BROADCAST_MESSAGES],
    });
  };

  return { copyBroadcast, loading };
};
