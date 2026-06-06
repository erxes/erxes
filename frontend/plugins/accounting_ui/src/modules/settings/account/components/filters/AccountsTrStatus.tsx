import { Combobox, Command, Popover } from 'erxes-ui';
import React from 'react';
import { Except } from 'type-fest';
import {
  TR_STATUS_LABELS,
  TR_STATUSES,
} from '~/modules/transactions/types/constants';

export const SelectAccountTrStatusCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > & {
    selected: string[] | null;
    onSelect?: (kind: string[] | null) => void;
  }
>(({ selected, onSelect, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected?.length
          ? selected.map((status) => TR_STATUS_LABELS[status]).join(', ')
          : 'Төлөв'}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsTrStatusCommand
          focusOnMount
          selected={selected}
          onSelect={onSelect}
        />
      </Combobox.Content>
    </Popover>
  );
});

export const AccountsTrStatusCommand = ({
  focusOnMount,
  selected,
  onSelect,
}: {
  focusOnMount?: boolean;
  selected: string[] | null;
  onSelect?: (journal: string[] | null) => void;
}) => {
  const toggleStatus = (trStatus: string) => {
    const selectedStatuses = selected || [];
    const nextSelected = selectedStatuses.includes(trStatus)
      ? selectedStatuses.filter((status) => status !== trStatus)
      : [...selectedStatuses, trStatus];

    onSelect?.(nextSelected.length ? nextSelected : null);
  };

  return (
    <Command>
      <Command.Input placeholder="Төлөвөөр шүүх" focusOnMount={focusOnMount} />
      <Command.List>
        {TR_STATUSES.ALL.map((trStatus) => (
          <Command.Item
            key={trStatus}
            value={trStatus}
            onSelect={() => toggleStatus(trStatus)}
          >
            {TR_STATUS_LABELS[trStatus]}
            <Combobox.Check checked={selected?.includes(trStatus)} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
