import { CHANNEL_REFETCH_QUERIES } from '@/channels/constants/refetchQueries';
import { ADD_CHANNEL_MEMBERS } from '@/channels/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import type {
  ChannelAddMembersMutation,
  ChannelAddMembersMutationVariables,
} from '~/gql/graphql';

export const useChannelMembersAdd = () => {
  const [channelAddMembers, { loading, error }] =
    useMutation(ADD_CHANNEL_MEMBERS);
  const handleChannelMembersAdd = (
    options: MutationFunctionOptions<
      ChannelAddMembersMutation,
      ChannelAddMembersMutationVariables
    >,
  ) => {
    channelAddMembers({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: CHANNEL_REFETCH_QUERIES,
    });
  };
  return { channelAddMembers: handleChannelMembersAdd, loading, error };
};
