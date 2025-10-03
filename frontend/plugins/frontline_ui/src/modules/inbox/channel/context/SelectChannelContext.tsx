import { IChannel } from '@/inbox/types/Channel';
import { createContext, useContext } from 'react';

export interface ISelectChannelContext {
  channelIds: string[];
  onSelect: (channel: IChannel) => void;
  channels: IChannel[];
  setChannels: (channels: IChannel[]) => void;
  loading: boolean;
  error: string | null;
}

export const SelectChannelContext = createContext<ISelectChannelContext | null>(
  null,
);

export const useSelectChannelContext = () => {
  const context = useContext(SelectChannelContext);

  if (!context) {
    throw new Error(
      'useSelectChannelContext must be used within a SelectChannelContext',
    );
  }

  return context;
};
