import { IChannelMember } from '@/channels/types';
import { ADD_CHANNEL_MEMBERS } from '@/channels/graphql';
import { MutationFunctionOptions, useMutation } from '@apollo/client';

interface IChannelMembersAddMutationResponse {
  channelAddMembers: IChannelMember[];
}

export const useChannelMembersAdd = () => {
  const [channelAddMembers, { loading, error }] =
    useMutation<IChannelMembersAddMutationResponse>(ADD_CHANNEL_MEMBERS);
  const handleChannelMembersAdd = (
    options: MutationFunctionOptions<IChannelMembersAddMutationResponse, any>,
  ) => {
    channelAddMembers({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      refetchQueries: ['GetChannelMembers'],
    });
  };
  return { channelAddMembers: handleChannelMembersAdd, loading, error };
};
