import { Combobox, Command, Popover } from 'erxes-ui';
import React from 'react';
import { Except } from 'type-fest';

const AccountIsOutBalance = ['True', 'False'];
const ACCOUNT_BOOLEAN_LABELS: Record<string, string> = {
  True: 'Тийм',
  False: 'Үгүй',
};

export const SelectAccountIsOutBalanceCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > & {
    selected: string | null;
    onSelect?: (isOutBalance: string | null) => void;
  }
>(({ selected, onSelect, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected ? ACCOUNT_BOOLEAN_LABELS[selected] : 'Бүгд'}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsIsOutBalanceCommand
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

export const AccountsIsOutBalanceCommand = ({
  focusOnMount,
  selected,
  onSelect,
}: {
  focusOnMount?: boolean;
  selected: string | null;
  onSelect?: (isOutBalance: string | null) => void;
}) => {
  return (
    <Command>
      <Command.Input
        placeholder="Баланс бусаар шүүх"
        focusOnMount={focusOnMount}
      />
      <Command.List>
        {AccountIsOutBalance.map((isOutBalance) => (
          <Command.Item
            key={isOutBalance}
            value={isOutBalance}
            onSelect={() => onSelect?.(isOutBalance)}
          >
            {ACCOUNT_BOOLEAN_LABELS[isOutBalance]}
            <Combobox.Check checked={selected === isOutBalance} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
