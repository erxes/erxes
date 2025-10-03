import { Combobox, Command, Popover, toast } from 'erxes-ui';

import { IconArrowDown } from '@tabler/icons-react';
import { useState } from 'react';

type Props = {
  config: { value: string; label: string }[];
  value: string; // current input value
  onChange: (value: string) => void;
};

const Attribution = ({ config, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (val: string) => {
    if (val.startsWith(' ')) {
      toast({
        title: 'Error',
        description:
          "Please make sure the attribution doesn't start with a space",
        variant: 'destructive',
      });
      return;
    }

    const characters = ['_', '-', '/', ' '];
    const newValue = characters.includes(val)
      ? value + val
      : value + `{${val}}`;

    onChange(newValue);
    setOpen(false); // close popover after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <span className="text-sm text-foreground/50 font-semibold flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors duration-200">
          Attribution <IconArrowDown size={13} />
        </span>
      </Popover.Trigger>
      <Popover.Content className="p-1">
        <Command shouldFilter={false}>
          <Command.List className="p-1">
            <Combobox.Empty />
            {config.map(({ value: val, label }) => (
              <Command.Item
                key={val}
                value={val}
                className="cursor-pointer text-xs"
                onSelect={() => handleSelect(val)}
              >
                {label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

export default Attribution;
