import { Command } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { IChannel } from '@/inbox/types/Channel';
import { toggleFilterValue } from '@/ticket/utils/filterValues';

export const ReportChannelFilter = ({
  value,
  onValueChange,
  channels,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  channels: IChannel[];
}) => {
  const { t } = useTranslation('frontline');
  const handleSelect = (id: string) => {
    if (id === 'all') {
      onValueChange([]);
      return;
    }
    onValueChange(toggleFilterValue(value, id));
  };

  return (
    <Command>
      <Command.Input placeholder={t('search-channel', 'Search channel')} />
      <Command.Empty>{t('no-channel-found', 'No channel found')}</Command.Empty>
      <Command.List className="max-h-[500px] overflow-y-auto">
        <Command.Item value="all" onSelect={() => handleSelect('all')}>
          <div className="flex items-center gap-2">
            {value.length === 0 && <IconCheck className="size-4" />}
            <span>{t('all-channels', 'All Channels')}</span>
          </div>
        </Command.Item>
        {channels.map((channel) => (
          <Command.Item
            key={channel._id}
            value={channel._id}
            keywords={[channel.name]}
            onSelect={() => handleSelect(channel._id)}
          >
            <div className="flex items-center gap-2">
              {value.includes(channel._id) && <IconCheck className="size-4" />}
              <span>{channel.name}</span>
            </div>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
