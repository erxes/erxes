import { useTranslation } from 'react-i18next';
import { Combobox, Command, Popover } from 'erxes-ui';
import React from 'react';
import { Except } from 'type-fest';
import {
  TR_STATUS_LABELS,
  TR_STATUSES,
} from '~/modules/transactions/types/constants';

export type TrStatusOptions = {
  statuses?: string[];
  labels?: Record<string, string>;
};

export const SelectAccountTrStatusCommand = React.forwardRef<
  React.ComponentRef<typeof Combobox.Trigger>,
  Except<
    React.ComponentPropsWithoutRef<typeof Combobox.Trigger>,
    'value' | 'onSelect'
  > &
    TrStatusOptions & {
      selected: string[] | null;
      onSelect?: (kind: string[] | null) => void;
    }
>(({ selected, onSelect, statuses, labels, ...props }, ref) => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger ref={ref} {...props}>
        {selected?.length
          ? selected
              .map((status) => t((labels ?? TR_STATUS_LABELS)[status] || ''))
              .join(', ')
          : t('status')}
      </Combobox.Trigger>
      <Combobox.Content>
        <AccountsTrStatusCommand
          focusOnMount
          selected={selected}
          onSelect={onSelect}
          statuses={statuses}
          labels={labels}
        />
      </Combobox.Content>
    </Popover>
  );
});

export const AccountsTrStatusCommand = ({
  focusOnMount,
  selected,
  onSelect,
  statuses = TR_STATUSES.ALL,
  labels = TR_STATUS_LABELS,
}: TrStatusOptions & {
  focusOnMount?: boolean;
  selected: string[] | null;
  onSelect?: (journal: string[] | null) => void;
}) => {
  const { t } = useTranslation('accounting');
  const toggleStatus = (trStatus: string) => {
    const selectedStatuses = selected || [];
    const nextSelected = selectedStatuses.includes(trStatus)
      ? selectedStatuses.filter((status) => status !== trStatus)
      : [...selectedStatuses, trStatus];

    onSelect?.(nextSelected.length ? nextSelected : null);
  };

  return (
    <Command>
      <Command.Input
        placeholder={t('filter-by-status')}
        focusOnMount={focusOnMount}
      />
      <Command.List>
        {statuses.map((trStatus) => (
          <Command.Item
            key={trStatus}
            value={trStatus}
            onSelect={() => toggleStatus(trStatus)}
          >
            {t(labels[trStatus] || '')}
            <Combobox.Check checked={selected?.includes(trStatus)} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
