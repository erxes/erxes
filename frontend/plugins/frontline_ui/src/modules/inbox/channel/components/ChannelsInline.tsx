import { IChannel } from '@/inbox/types/Channel';
import {
  ChannelsInlineContext,
  useChannelsInlineContext,
} from '@/inbox/channel/context/ChannelsInlineContext';
import { Skeleton, TextOverflowTooltip, Tooltip } from 'erxes-ui';
import { useChannelInline } from '../hooks/useChannelInline';
import { useEffect, useState } from 'react';

export const ChannelsInline = ({
  channels,
  channelIds,
  placeholder,
  updateChannels,
}: {
  channels?: IChannel[];
  channelIds?: string[];
  placeholder?: string;
  updateChannels?: (channels: IChannel[]) => void;
}) => {
  return (
    <ChannelsInlineProvider
      channels={channels}
      channelIds={channelIds}
      placeholder={placeholder}
      updateChannels={updateChannels}
    >
      <ChannelsInlineTitle />
    </ChannelsInlineProvider>
  );
};

export const ChannelsInlineProvider = ({
  children,
  channels,
  channelIds,
  placeholder,
  updateChannels,
}: {
  children?: React.ReactNode;
  channels?: IChannel[];
  channelIds?: string[];
  placeholder?: string;
  updateChannels?: (channels: IChannel[]) => void;
}) => {
  const [_channels, _setChannels] = useState<IChannel[]>(channels || []);

  return (
    <ChannelsInlineContext.Provider
      value={{
        channels: channels || _channels,
        loading: false,
        channelIds: channelIds || [],
        placeholder: placeholder || 'Select channels',
        updateChannels: updateChannels || _setChannels,
      }}
    >
      {children}
      {channelIds?.map((channelId) => (
        <ChannelInlineEffectComponent key={channelId} channelId={channelId} />
      ))}
    </ChannelsInlineContext.Provider>
  );
};

export const ChannelInlineEffectComponent = ({
  channelId,
}: {
  channelId: string;
}) => {
  const { channels, channelIds, updateChannels } = useChannelsInlineContext();
  const { channelDetail } = useChannelInline({
    variables: {
      id: channelId,
    },
    skip: !channelId || channels.some((c) => c._id === channelId),
  });

  useEffect(() => {
    const newChannels = [...channels].filter((c) =>
      channelIds?.includes(c._id),
    );

    if (channelDetail) {
      updateChannels?.([...newChannels, channelDetail]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelDetail]);

  return null;
};

export const ChannelsInlineTitle = () => {
  const { channels, loading, placeholder } = useChannelsInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (channels.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (channels.length < 3) {
    return (
      <TextOverflowTooltip value={channels.map((c) => c.name).join(', ')} />
    );
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>{`${channels.length} channels`}</Tooltip.Trigger>
        <Tooltip.Content>
          {channels.map((channel) => channel.name).join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
