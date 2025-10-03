import { Combobox, Command, Popover } from 'erxes-ui';
import { JournalEnum } from '../types/Account';
import React from 'react';
import { Except } from 'type-fest';
import { JOURNAL_LABELS } from '../constants/journalLabel';

export const SelectAccountJournalCommand = React.forwardRef<
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
        <AccountsJournalCommand
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

export const AccountsJournalCommand = ({
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
        {[...Object.values(JournalEnum)].map((journal) => (
          <Command.Item
            key={journal}
            value={journal}
            onSelect={() => onSelect?.(journal)}
          >
            {JOURNAL_LABELS[journal]}
            <Combobox.Check checked={selected === journal} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
