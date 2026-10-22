import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { currentUserState } from 'ui-modules';

const CHANNEL_ADMIN_ROLE = 'admin';

/**
 * Channels whose settings the current user may open: the same rule the API
 * applies to channel edits (owner, or the channel's admin).
 */
export const useCanManageChannels = (channelIds: string[]) => {
  const currentUser = useAtomValue(currentUserState);
  const isOwner = currentUser?.isOwner === true;
  const { members } = useGetChannelMembers({
    channelIds: isOwner ? [] : channelIds,
  });

  return useMemo(() => {
    const managed = new Set(
      (members ?? [])
        .filter(
          (member) =>
            member.memberId === currentUser?._id &&
            member.role === CHANNEL_ADMIN_ROLE,
        )
        .map((member) => member.channelId),
    );

    return (channelId?: string | null) =>
      !!channelId && (isOwner || managed.has(channelId));
  }, [members, currentUser?._id, isOwner]);
};
