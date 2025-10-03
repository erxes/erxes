import { useQueryState } from 'erxes-ui';
import ChannelsTable from './channels/ChannelsTable';
import { ChannelDetailSheet } from './channels/details/ChannelDetailSheet';

export const ChannelsSettings = () => {
  const [channelId] = useQueryState('channel_id');
  return (
    <>
      <ChannelsTable />
      {!!channelId && <ChannelDetailSheet />}
    </>
  );
};
