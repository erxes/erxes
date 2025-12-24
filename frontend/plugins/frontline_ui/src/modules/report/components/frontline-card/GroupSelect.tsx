import { PopoverScoped, Combobox, Command } from 'erxes-ui';
import { useState } from 'react';

interface GroupSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const GroupSelect = ({
  value = 'all',
  onValueChange,
}: GroupSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setOpen(false);
  };

  const getDisplayLabel = () => {
    const labels: Record<string, string> = {
      all: 'All Sources',
      'facebook-messenger': 'Facebook Messenger',
      'facebook-post': 'Facebook Post',
      'instagram-messenger': 'Instagram Messenger',
      'instagram-post': 'Instagram Post',
      call: 'Call',
      messenger: 'Messenger',
      form: 'Form',
    };
    return labels[value] || value;
  };

  return (
    <div className="flex items-center gap-2 shrink-0 flex-none">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Group By
      </span>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase>
          <span className="text-xs">{getDisplayLabel()}</span>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <Command>
            <Command.List>
              <Command.Item
                value="all"
                onSelect={() => handleValueChange('all')}
              >
                All Sources
              </Command.Item>
              <Command.Item
                value="facebook-messenger"
                onSelect={() => handleValueChange('facebook-messenger')}
              >
                Facebook Messenger
              </Command.Item>
              <Command.Item
                value="facebook-post"
                onSelect={() => handleValueChange('facebook-post')}
              >
                Facebook Post
              </Command.Item>
              <Command.Item
                value="instagram-messenger"
                onSelect={() => handleValueChange('instagram-messenger')}
              >
                Instagram Messenger
              </Command.Item>
              <Command.Item
                value="instagram-post"
                onSelect={() => handleValueChange('instagram-post')}
              >
                Instagram Post
              </Command.Item>
              <Command.Item
                value="call"
                onSelect={() => handleValueChange('call')}
              >
                Call
              </Command.Item>
              <Command.Item
                value="messenger"
                onSelect={() => handleValueChange('messenger')}
              >
                Messenger
              </Command.Item>
              <Command.Item
                value="form"
                onSelect={() => handleValueChange('form')}
              >
                Form
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </PopoverScoped>
    </div>
  );
};
