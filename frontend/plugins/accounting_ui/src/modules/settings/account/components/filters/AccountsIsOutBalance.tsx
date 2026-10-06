import { useTranslation } from 'react-i18next';
import { Combobox, Command, Popover } from 'erxes-ui';
import React from 'react';
import { Except } from 'type-fest';

const AccountIsOutBalance = ['True', 'False'];
const ACCOUNT_BOOLEAN_LABELS: Record<string, string> = {
  True: 'yes',
  False: 'no',
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
  const { t } = useTranslation('accounting');

  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected
          ? t(ACCOUNT_BOOLEAN_LABELS[selected])
          : t('global-search.all')}
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
  const { t } = useTranslation('accounting');

  return (
    <Command>
      <Command.Input
        placeholder={t('filter-by-off-balance-sheet-status')}
        focusOnMount={focusOnMount}
      />
      <Command.List>
        {AccountIsOutBalance.map((isOutBalance) => (
          <Command.Item
            key={isOutBalance}
            value={isOutBalance}
            onSelect={() => onSelect?.(isOutBalance)}
          >
            {t(ACCOUNT_BOOLEAN_LABELS[isOutBalance])}
            <Combobox.Check checked={selected === isOutBalance} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
