import { MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_CHANNEL } from '../graphql';

export const useChannelAdd = () => {
  const [addChannel, { loading }] = useMutation(ADD_CHANNEL);

  const handleAddChannel = (options: MutationHookOptions) => {
    addChannel({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: ['GetChannels', 'GetChannelMembers'],
    });
  };

  return { addChannel: handleAddChannel, loading };
};
