import { IconSparkles, type TablerIcon } from '@tabler/icons-react';
import { Combobox, Command, Popover, cn } from 'erxes-ui';
import React, { forwardRef, useMemo, useState } from 'react';

import {
  AMENITY_ICON_OPTIONS,
  getAmenityIconOption,
} from '../constants/amenityIcons';

type AmenityIconPickerProps =
  React.ComponentProps<typeof Combobox.TriggerBase> & {
    value?: string;
    onValueChange?: (value: string | null) => void;
  };

export const AmenityIconPicker = forwardRef<
  HTMLButtonElement,
  AmenityIconPickerProps
>(({ value, onValueChange, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(() => getAmenityIconOption(value), [value]);
  const sortedOptions = useMemo(() => {
    return [...AMENITY_ICON_OPTIONS].sort((a, b) => {
      if (a.name === value) return -1;
      if (b.name === value) return 1;
      return 0;
    });
  }, [value]);

  const SelectedIcon = (selectedOption?.icon || IconSparkles) as TablerIcon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.TriggerBase
        variant="ghost"
        size="icon"
        className="px-2"
        ref={ref}
        {...props}
      >
        <SelectedIcon />
      </Combobox.TriggerBase>

      <Combobox.Content className="w-60 min-w-60">
        <Command>
          <Command.Input placeholder="Search icon..." />
          <Command.List className="max-h-[200px] overflow-y-auto hide-scroll [&>div]:flex [&>div]:flex-wrap [&>div]:gap-2 justify-center">
            <Command.Item
              value="No icon"
              keywords={['clear', 'remove', 'empty', 'none']}
              onSelect={() => {
                onValueChange?.(null);
                setOpen(false);
              }}
              className={cn(!selectedOption && 'text-primary')}
            >
              <IconSparkles />
            </Command.Item>

            {sortedOptions.map((option) => {
              const Icon = option.icon as TablerIcon;

              return (
                <Command.Item
                  key={option.name}
                  value={option.label}
                  keywords={[option.name, ...option.keywords]}
                  onSelect={() => {
                    onValueChange?.(option.name);
                    setOpen(false);
                  }}
                  className={cn(value === option.name && 'text-primary')}
                >
                  <Icon />
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
});

AmenityIconPicker.displayName = 'AmenityIconPicker';
