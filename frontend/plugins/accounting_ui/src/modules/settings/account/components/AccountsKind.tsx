import { Combobox, Command, Popover } from 'erxes-ui';
import { AccountKind } from '../types/Account';
import React from 'react';
import { Except } from 'type-fest';

export const SelectAccountKindCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > & {
    selected: string | null;
    onSelect?: (kind: string | null) => void;
  }
>(({ selected, onSelect, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected ?? 'All'}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsKindCommand
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

export const AccountsKindCommand = ({
  focusOnMount,
  selected,
  onSelect,
}: {
  focusOnMount?: boolean;
  selected: string | null;
  onSelect?: (kind: string | null) => void;
}) => {
  return (
    <Command>
      <Command.Input placeholder="Filter kind" focusOnMount={focusOnMount} />
      <Command.List>
        {[...Object.values(AccountKind)].map((kind) => (
          <Command.Item
            key={kind}
            value={kind}
            onSelect={() => onSelect?.(kind)}
          >
            {kind}
            <Combobox.Check checked={selected === kind} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
