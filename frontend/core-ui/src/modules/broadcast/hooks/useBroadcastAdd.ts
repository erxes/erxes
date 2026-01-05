import { MutationHookOptions, useMutation } from '@apollo/client';
import { BROADCAST_MESSAGE_ADD } from '../graphql/mutations';

export const useBroadcastAdd = () => {
  const [mutate, { loading }] = useMutation(BROADCAST_MESSAGE_ADD);

  const addBroadcast = ({
    variables,
    ...options
  }: MutationHookOptions<{ engageMessageAdd: { _id: string } }, any>) => {
    return mutate({
      ...options,
      variables,
    });
  };

  return { addBroadcast, loading };
};
