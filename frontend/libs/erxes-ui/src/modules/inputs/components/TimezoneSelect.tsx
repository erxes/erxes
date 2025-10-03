import { Combobox, Command, Popover } from 'erxes-ui/components';
import { IANA_TIME_ZONES } from 'erxes-ui/constants/IanaTimeZones';
import { formatTimeZoneLabel } from 'erxes-ui/utils/localization/formatTimeZoneLabel';
import React from 'react';
import { useState } from 'react';

export const TimezoneSelect = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  React.ComponentProps<typeof Combobox.Trigger> & {
    value: string;
    onValueChange: (value: string) => void;
  }
>(({ value, onValueChange, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        <Combobox.Value
          placeholder="Select timezone"
          value={formatTimeZoneLabel(value)}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input />
          <Command.List>
            <Command.Empty>no timezone found</Command.Empty>
            {IANA_TIME_ZONES.map((timezone) => (
              <Command.Item
                key={timezone}
                value={timezone}
                onSelect={() => {
                  onValueChange(timezone);
                  setOpen(false);
                }}
              >
                {formatTimeZoneLabel(timezone)}
                <Combobox.Check checked={timezone === value} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
});
