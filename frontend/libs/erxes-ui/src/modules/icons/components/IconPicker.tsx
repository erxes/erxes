import { Popover, Command, Combobox } from 'erxes-ui/components';
import { IconComponent } from './IconComponent';
import { useIcons } from 'erxes-ui/modules/icons/hooks/useIcons';
import { useState } from 'react';
import { cn } from 'erxes-ui/lib';
import { forwardRef } from 'react';

export const IconPicker = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Combobox.TriggerBase> & {
    value?: string;
    onValueChange?: (value: string | null) => void;
  }
>(({ value, onValueChange, ...props }, ref) => {
  const { getIcons } = useIcons();
  const [_value, setValue] = useState(value);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase
        variant="ghost"
        size="icon"
        className="px-2"
        ref={ref}
        {...props}
      >
        <IconComponent name={_value} />
      </Combobox.TriggerBase>

      <Combobox.Content className="w-60 min-w-60">
        <Command>
          <Command.Input placeholder="Search icon..." />
          <Command.List className="max-h-[200px] overflow-y-auto hide-scroll [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2 justify-center">
            {Object.entries(getIcons())
              .sort((a, b) => (a[0] === _value ? -1 : 1))
              .map(([key, Icon]) => (
                <Command.Item
                  key={key}
                  onSelect={() => {
                    setValue(key);
                    onValueChange?.(key);
                    setOpen(false);
                  }}
                  value={key}
                  className={cn(_value === key && 'text-primary')}
                >
                  <Icon />
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
});
