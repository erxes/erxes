import { CHANNEL_REFETCH_QUERIES } from '@/channels/constants/refetchQueries';
import { UPDATE_CHANNEL } from '@/channels/graphql';
import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  ChannelUpdateMutation,
  ChannelUpdateMutationVariables,
} from '~/gql/graphql';

export const useChannelUpdate = () => {
  const [updateChannel, { loading }] = useMutation(UPDATE_CHANNEL);
  const handleUpdateChannel = (
    options: MutationHookOptions<
      ChannelUpdateMutation,
      ChannelUpdateMutationVariables
    >,
  ) => {
    updateChannel({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: CHANNEL_REFETCH_QUERIES,
    });
  };

  return { updateChannel: handleUpdateChannel, loading };
};
