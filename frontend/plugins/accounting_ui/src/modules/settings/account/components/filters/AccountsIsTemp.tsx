import { Combobox, Command, Popover } from 'erxes-ui';
import React from 'react';
import { Except } from 'type-fest';

const AccountIsTemp = ['True', 'False']

export const SelectAccountIsTempCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > & {
    selected: string | null;
    onSelect?: (isTemp: string | null) => void;
  }
>(({ selected, onSelect, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected ?? 'All'}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsIsTempCommand
          focusOnMount
          selected={selected}
          onSelect={(value) => {
            onSelect?.(value);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
});

export const AccountsIsTempCommand = ({
  focusOnMount,
  selected,
  onSelect,
}: {
  focusOnMount?: boolean;
  selected: string | null;
  onSelect?: (isTemp: string | null) => void;
}) => {
  return (
    <Command>
      <Command.Input placeholder="Filter isTemp" focusOnMount={focusOnMount} />
      <Command.List>
        {AccountIsTemp.map((isTemp) => (
          <Command.Item
            key={isTemp}
            value={isTemp}
            onSelect={() => onSelect?.(isTemp)}
          >
            {isTemp}
            <Combobox.Check checked={selected === isTemp} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
