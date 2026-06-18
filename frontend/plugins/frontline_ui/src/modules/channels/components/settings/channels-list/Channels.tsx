import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { IChannelMember } from '@/channels/types';
import { useQueryState, Skeleton } from 'erxes-ui';
import { IconBrandTrello } from '@tabler/icons-react';
import { useMemo } from 'react';
import { ChannelCard } from './ChannelCard';

export function Channels() {
  const [searchValue] = useQueryState<string | null>('searchValue');
  const { channels, loading } = useGetChannels({
    variables: { name: searchValue || undefined },
  });

  const channelIds = useMemo(
    () => (channels ?? []).map((channel) => channel._id),
    [channels],
  );

  const { members } = useGetChannelMembers({ channelIds });

  const membersByChannel = useMemo(() => {
    const map: Record<string, IChannelMember[]> = {};
    for (const member of members ?? []) {
      (map[member.channelId] ||= []).push(member);
    }
    return map;
  }, [members]);

  if (loading && (!channels || channels.length === 0)) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 p-3">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!loading && (!channels || channels.length === 0)) {
    return (
      <div className="overflow-hidden h-full px-8 flex flex-col">
        <div className="bg-sidebar size-full border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
          <div className="size-full flex flex-col items-center justify-center">
            <IconBrandTrello
              size={64}
              stroke={1.5}
              className="text-muted-foreground"
            />
            <h2 className="text-lg font-semibold text-accent-foreground">
              No channels found
            </h2>
            <p className="text-md text-muted-foreground mb-4">
              Create a channel to start organizing your team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 p-3">
        {(channels ?? []).map((channel) => (
          <ChannelCard
            key={channel._id}
            channel={channel}
            members={membersByChannel[channel._id]}
          />
        ))}
      </div>
    </div>
  );
}
