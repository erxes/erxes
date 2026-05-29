import { Channels } from '@/channels/components/settings/channels-list/Channels';
import { ChannelsSubHeader } from '@/channels/components/settings/channels-list/ChannelsSubHeader';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';

export const ChannelsSettingsIndexPage = () => {
  return (
    <div className="max-h-screen">
      <div className="ml-auto flex justify-between px-8 py-6">
        <h1 className="text-xl font-semibold">Channels</h1>
        <CreateChannel />
      </div>
      <ChannelsSubHeader />
      <Channels />
    </div>
  );
};
