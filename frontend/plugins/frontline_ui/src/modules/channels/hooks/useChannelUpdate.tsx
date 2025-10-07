import { UPDATE_CHANNEL } from '@/channels/graphql';
import { MutationHookOptions, useMutation } from '@apollo/client';

export const useChannelUpdate = () => {
  const [updateChannel, { loading }] = useMutation(UPDATE_CHANNEL);
  const handleUpdateChannel = (options: MutationHookOptions) => {
    updateChannel({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: ['GetChannels', 'GetChannelMembers'],
    });
  };

  return { updateChannel: handleUpdateChannel, loading };
};
