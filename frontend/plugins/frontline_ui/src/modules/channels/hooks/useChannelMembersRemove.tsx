import { REMOVE_CHANNEL_MEMBERS } from '@/channels/graphql';
import { useBulkRemove } from '@/channels/hooks/useBulkRemove';
import { useMutation } from '@apollo/client';

interface IChannelMemberRemoveMutationResponse {
  channelRemoveMember: { __typename: string } | null;
}

export const useChannelMembersRemove = () => {
  const [singleMemberRemove] =
    useMutation<IChannelMemberRemoveMutationResponse>(REMOVE_CHANNEL_MEMBERS);
  const { bulkRemove, loading } = useBulkRemove(['GetChannelMembers']);

  const removeMembers = (memberIds: string[], channelId: string) =>
    bulkRemove(memberIds, (memberId) =>
      singleMemberRemove({ variables: { channelId, memberId } }),
    );

  return { removeMembers, loading };
};
