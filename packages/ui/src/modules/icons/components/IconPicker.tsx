import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import { useIcons } from 'erxes-ui/modules/icons/hooks/useIcons';
import { useState } from 'react';
import { IconComponent } from './IconComponent';

export const IconPicker = ({
  ref,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof Combobox.TriggerBase> & {
  value?: string;
  onValueChange?: (value: string | null) => void;
} & React.RefAttributes<HTMLButtonElement>) => {
  const { getIcons } = useIcons();
  const [_value, setValue] = useState(value);
  const [open, setOpen] = useState(false);
  const icons = Object.entries(getIcons());

  const selectedFirst = [
    ...icons.filter(([key]) => key === _value),
    ...icons.filter(([key]) => key !== _value),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase variant="ghost" size="icon" className="px-2" ref={ref} {...props}>
        <IconComponent name={_value} />
      </Combobox.TriggerBase>

      <Combobox.Content className="w-60 min-w-60">
        <Command>
          <Command.Input placeholder="Search icon..." />
          <Command.List className="max-h-[200px] overflow-y-auto hide-scroll [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2 justify-center">
            {selectedFirst.map(([key, Icon]) => (
              <Command.Item
                key={key}
                onSelect={() => {
                  setValue(key);
                  onValueChange?.(key);
                  setOpen(false);
                }}
                value={key}
                className={cn(_value === key && 'text-primary-text')}
              >
                <Icon />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
