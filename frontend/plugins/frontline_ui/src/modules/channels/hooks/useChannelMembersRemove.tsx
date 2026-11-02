import { CHANNEL_REFETCH_QUERIES } from '@/channels/constants/refetchQueries';
import { REMOVE_CHANNEL_MEMBERS } from '@/channels/graphql';
import { useBulkRemove } from '@/channels/hooks/useBulkRemove';
import { useMutation } from '@apollo/client';

export const useChannelMembersRemove = () => {
  const [singleMemberRemove] = useMutation(REMOVE_CHANNEL_MEMBERS);
  const { bulkRemove, loading } = useBulkRemove(CHANNEL_REFETCH_QUERIES);

  const removeMembers = (memberIds: string[], channelId: string) =>
    bulkRemove(memberIds, (memberId) =>
      singleMemberRemove({ variables: { channelId, memberId } }),
    );

  return { removeMembers, loading };
};
