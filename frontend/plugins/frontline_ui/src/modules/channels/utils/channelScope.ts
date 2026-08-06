import { ChannelScope, IChannel } from '@/channels/types';

// Channels saved before `scope` existed carry no value; they are team channels.
export const channelScopeOf = (channel: Pick<IChannel, 'scope'>): ChannelScope =>
  channel.scope === ChannelScope.PERSONAL
    ? ChannelScope.PERSONAL
    : ChannelScope.TEAM;
