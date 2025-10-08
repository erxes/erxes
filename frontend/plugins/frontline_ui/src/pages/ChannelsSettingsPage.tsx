import { PageSubHeader } from 'erxes-ui';
import { ChannelsFilter } from '@/settings/components/channels/ChannelsFilter';
import { ChannelsSettings } from '@/settings/components/ChannelsSettings';

export const ChannelsSettingsPage = () => {
  return (
    <div className="w-full overflow-hidden flex flex-col">
      <ChannelsFilter />
      <ChannelsSettings />
    </div>
  );
};
