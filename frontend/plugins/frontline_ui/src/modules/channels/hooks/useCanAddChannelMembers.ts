import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useCanManageChannels } from './useCanManageChannels';
import { useGetChannelMembers } from './useGetChannelMembers';

export const useCanAddChannelMembers = (channelId: string): boolean => {
  const currentUser = useAtomValue(currentUserState);
  const canManage = useCanManageChannels([channelId]);
  const { members } = useGetChannelMembers({ channelIds: [channelId] });
  return (
    canManage(channelId) ||
    !!members?.some(
      (member) =>
        member.memberId === currentUser?._id && member.role === 'lead',
    )
  );
};
