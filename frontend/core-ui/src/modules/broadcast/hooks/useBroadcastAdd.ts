import { MutationHookOptions, useMutation } from '@apollo/client';
import { BROADCAST_MESSAGE_ADD } from '../graphql/mutations';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastAdd = () => {
  const [mutate, { loading }] = useMutation(BROADCAST_MESSAGE_ADD);

  const addBroadcast = ({
    variables,
    ...options
  }: MutationHookOptions<{ engageMessageAdd: { _id: string } }, any>) => {
    return mutate({
      ...options,
      variables,
      refetchQueries: [BROADCAST_MESSAGES],
    });
  };

  return { addBroadcast, loading };
};
