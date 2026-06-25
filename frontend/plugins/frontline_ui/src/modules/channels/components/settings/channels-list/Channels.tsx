import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { IChannelMember } from '@/channels/types';
import { useQueryState, Skeleton } from 'erxes-ui';
import { IconBrandTrello } from '@tabler/icons-react';
import { useMemo } from 'react';
import { ChannelCard } from './ChannelCard';
import { useTranslation } from 'react-i18next';

export function Channels() {
  const { t } = useTranslation('frontline');
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
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
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
              {t('no-channels-found')}
            </h2>
            <p className="text-md text-muted-foreground mb-4">
              {t('no-channels-description')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const channelCount = channels?.length ?? 0;

  return (
    <div className="overflow-auto h-full">
      <div className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">
            All channels
            <span className="ml-1.5 text-muted-foreground">{channelCount}</span>
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {(channels ?? []).map((channel) => (
            <ChannelCard
              key={channel._id}
              channel={channel}
              members={membersByChannel[channel._id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
