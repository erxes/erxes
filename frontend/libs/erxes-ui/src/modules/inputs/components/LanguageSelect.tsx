import React, { useState } from 'react';
import { Combobox, Command, Popover } from 'erxes-ui/components';
import { INTL_LANGUAGES } from 'erxes-ui/constants/IntlLanguages';

export const LanguageSelect = React.forwardRef<
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
          placeholder="Select language"
          value={Object.entries(INTL_LANGUAGES)
            .find(([_, code]) => code === value)
            ?.at(0)}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input />
          <Command.List>
            <Command.Empty>no language found</Command.Empty>
            {Object.entries(INTL_LANGUAGES).map(([language, code]) => (
              <Command.Item
                key={code}
                value={`${code}|${language}`}
                onSelect={() => {
                  onValueChange(code);
                  setOpen(false);
                }}
              >
                {language}
                <Combobox.Check checked={value === code} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
});
