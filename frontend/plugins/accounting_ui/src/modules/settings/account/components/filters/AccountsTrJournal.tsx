import { useTranslation } from 'react-i18next';
import { Combobox, Command, Popover } from 'erxes-ui';
import React from 'react';
import { Except } from 'type-fest';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from '~/modules/transactions/types/constants';

export const SelectAccountTrJournalCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > & {
    selected: string | null;
    onSelect?: (kind: string | null) => void;
  }
>(({ selected, onSelect, ...props }, ref) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected
          ? t(TR_JOURNAL_LABELS[selected as TrJournalEnum] || '')
          : t('all')}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsTrJournalCommand
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

export const AccountsTrJournalCommand = ({
  focusOnMount,
  selected,
  onSelect,
}: {
  focusOnMount?: boolean;
  selected: string | null;
  onSelect?: (journal: string | null) => void;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Command>
      <Command.Input
        placeholder={t('filter-by-journal')}
        focusOnMount={focusOnMount}
      />
      <Command.List>
        {Object.values(TrJournalEnum).map((trJournal) => (
          <Command.Item
            key={trJournal}
            value={trJournal}
            onSelect={() => onSelect?.(trJournal)}
          >
            {t(TR_JOURNAL_LABELS[trJournal] || '')}
            <Combobox.Check checked={selected === trJournal} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
