import { useState } from 'react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { IconCheck } from '@tabler/icons-react';
import { PopoverScoped, Combobox, Command } from 'erxes-ui';
import { Skeleton } from 'erxes-ui';
import { IChannel } from '@/inbox/types/Channel';

interface ChannelSelectProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

export const ChannelSelect = ({
  value = [],
  onValueChange,
}: ChannelSelectProps) => {
  const { channels, loading } = useGetChannels();
  const [open, setOpen] = useState(false);

  if (loading)
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </div>
    );

  if (!channels?.length)
    return (
      <div className="text-sm text-accent-foreground ml-3 my-4">
        No channels found
      </div>
    );

  const getDisplayLabel = () => {
    if (!value || value.length === 0) return 'All Channels';
    if (value.length === 1) {
      const channel = channels.find((c: IChannel) => c._id === value[0]);
      return channel?.name || 'All Channels';
    }
    return `${value.length} Channels`;
  };

  const handleValueChange = (selectedValue: string) => {
    let newValue: string[];

    if (selectedValue === 'all') {
      newValue = [];
    } else {
      const isSelected = value.includes(selectedValue);
      if (isSelected) {
        newValue = value.filter((id) => id !== selectedValue);
      } else {
        newValue = [...value, selectedValue];
      }
    }

    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2 shrink-0 flex-none">
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase>
          <span className="text-xs cursor-pointer hover:text-foreground">
            {getDisplayLabel()}
          </span>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <Command>
            <Command.List>
              <Command.Item
                value="all"
                onSelect={() => handleValueChange('all')}
              >
                <div className="flex items-center gap-2">
                  {(!value || value.length === 0) && (
                    <IconCheck className="size-4" />
                  )}
                  <span>All Channels</span>
                </div>
              </Command.Item>

              {channels.map((channel) => (
                <Command.Item
                  key={channel._id}
                  value={channel._id}
                  onSelect={() => handleValueChange(channel._id)}
                >
                  {channel.name}
                  <Combobox.Check checked={value.includes(channel._id)} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </PopoverScoped>
    </div>
  );
};
