import { Combobox, Command, Popover } from 'erxes-ui';
import { AccountStatus, ACCOUNT_STATUS_LABELS } from '../../types/Account';
import React from 'react';
import { Except } from 'type-fest';

export const SelectAccountStatusCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > & {
    selected: string | null;
    onSelect?: (status: string | null) => void;
  }
>(({ selected, onSelect, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected ? ACCOUNT_STATUS_LABELS[selected as AccountStatus] : 'Бүгд'}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsStatusCommand
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

export const AccountsStatusCommand = ({
  focusOnMount,
  selected,
  onSelect,
}: {
  focusOnMount?: boolean;
  selected: string | null;
  onSelect?: (status: string | null) => void;
}) => {
  return (
    <Command>
      <Command.Input placeholder="Төлөвөөр шүүх" focusOnMount={focusOnMount} />
      <Command.List>
        {Object.values(AccountStatus).map((status) => (
          <Command.Item
            key={status}
            value={status}
            onSelect={() => onSelect?.(status)}
          >
            {ACCOUNT_STATUS_LABELS[status]}
            <Combobox.Check checked={selected === status} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
