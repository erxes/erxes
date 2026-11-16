import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { Popover } from 'erxes-ui/components/popover';
import { useIcons } from 'erxes-ui/modules/icons/hooks/useIcons';
import { useState } from 'react';
import { IconComponent } from './IconComponent';

/**
 * A button that picks a Tabler icon from a searchable list in a popover.
 * Controlled: shows `value`, and reports a pick through `onValueChange`.
 */
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
  const [open, setOpen] = useState(false);
  const icons = Object.entries(getIcons());

  const selectedFirst = [
    ...icons.filter(([key]) => key === value),
    ...icons.filter(([key]) => key !== value),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase variant="ghost" size="icon" ref={ref} {...props}>
        <IconComponent name={value} />
      </Combobox.TriggerBase>

      <Combobox.Content className="w-60 min-w-60">
        <Command>
          <Command.Input placeholder="Search icon..." />
          <Command.List className="max-h-50 overflow-y-auto hide-scroll">
            <div className="flex flex-wrap gap-2">
              {selectedFirst.map(([key, Icon]) => (
                <Command.Item
                  key={key}
                  onSelect={() => {
                    onValueChange?.(key);
                    setOpen(false);
                  }}
                  value={key}
                  checked={value === key}
                >
                  <Icon />
                </Command.Item>
              ))}
            </div>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
