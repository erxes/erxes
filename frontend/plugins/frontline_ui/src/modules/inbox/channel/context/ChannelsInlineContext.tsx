import { IChannel } from '@/inbox/types/Channel';
import { createContext, useContext } from 'react';

export interface IChannelsInlineContext {
  channels: IChannel[];
  loading: boolean;
  channelIds?: string[];
  placeholder?: string;
  updateChannels?: (channels: IChannel[]) => void;
}

export const ChannelsInlineContext =
  createContext<IChannelsInlineContext | null>(null);

export const useChannelsInlineContext = () => {
  const context = useContext(ChannelsInlineContext);
  if (!context) {
    throw new Error(
      'useChannelsInlineContext must be used within a ChannelsInlineProvider',
    );
  }
  return context;
};
