import { Channels } from '@/channels/components/channels-list/Channels';
import { CreateChannel } from '@/channels/components/channels-list/CreateChannel';

export const ChannelsSettingsIndexPage = () => {
  return (
    <div className="max-h-screen">
      <div className="ml-auto flex justify-between px-8 py-6">
        <h1 className="text-xl font-semibold">Channels</h1>
        <CreateChannel />
      </div>
      <Channels />
    </div>
  );
};
