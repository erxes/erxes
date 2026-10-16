import { MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_CHANNEL } from '../graphql';
import type {
  ChannelAddMutation,
  ChannelAddMutationVariables,
} from '~/gql/graphql';

export const useChannelAdd = () => {
  const [addChannel, { loading }] = useMutation(ADD_CHANNEL);

  const handleAddChannel = (
    options: MutationHookOptions<
      ChannelAddMutation,
      ChannelAddMutationVariables
    >,
  ) => {
    addChannel({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      // GetMyChannels backs the inbox sidebar groups, which is one of the
      // places a channel can be created from.
      refetchQueries: [
        'frontlineChannelList',
        'GetMyChannels',
        'GetChannelMembers',
      ],
    });
  };

  return { addChannel: handleAddChannel, loading };
};
