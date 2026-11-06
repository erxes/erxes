import { UPDATE_CHANNEL } from '@/channels/graphql';
import { MutationHookOptions, useMutation } from '@apollo/client';
import type {
  ChannelUpdateMutation,
  ChannelUpdateMutationVariables,
} from '~/gql/graphql';

/** Provides channel updates that refresh channel and member lists. */
export const useChannelUpdate = () => {
  const [updateChannel, { loading }] = useMutation(UPDATE_CHANNEL);
  /** Runs an update with caller callbacks and channel/member refetches. */
  const handleUpdateChannel = (
    options: MutationHookOptions<
      ChannelUpdateMutation,
      ChannelUpdateMutationVariables
    >,
  ) => {
    return updateChannel({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: ['frontlineChannelList', 'GetChannelMembers'],
    });
  };

  return { updateChannel: handleUpdateChannel, loading };
};
