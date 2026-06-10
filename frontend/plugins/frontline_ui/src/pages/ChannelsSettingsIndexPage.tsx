import { Channels } from '@/channels/components/settings/channels-list/Channels';
import { ChannelsSubHeader } from '@/channels/components/settings/channels-list/ChannelsSubHeader';

export const ChannelsSettingsIndexPage = () => {
  return (
    <>
      <ChannelsSubHeader />
      <Channels />
    </>
  );
};
