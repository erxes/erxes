import { Button, Combobox, Popover, PopoverScoped, Separator } from 'erxes-ui';
import { IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  ticketSortAtom,
  ticketSortDirectionAtom,
} from '@/ticket/states/ticketSortState';
import { fetchedTicketsState } from '@/ticket/states/fetchedTicketState';
import {
  TICKET_SORT_DIRECTIONS,
  TICKET_SORT_FIELDS,
  TicketSortDirection,
  TicketSortField,
} from '@/ticket/hooks/useGetTickets';

const TicketsSortOption = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Button
    variant={selected ? 'secondary' : 'ghost'}
    className="w-full justify-between"
    aria-pressed={selected}
    onClick={onClick}
  >
    {label}
    <Combobox.Check checked={selected} />
  </Button>
);

export const TicketsSortControl = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const [isOpen, setIsOpen] = useState(false);
  const [sortField, setSortField] = useAtom(ticketSortAtom);
  const [sortDirection, setSortDirection] = useAtom(ticketSortDirectionAtom);
  const setFetchedTickets = useSetAtom(fetchedTicketsState);
  const activeField = TICKET_SORT_FIELDS.find(
    (field) => field.value === sortField,
  );
  const Icon = sortDirection === 1 ? IconSortAscending : IconSortDescending;

  const applySort = (
    field: TicketSortField,
    direction: TicketSortDirection,
  ) => {
    setIsOpen(false);
    if (field === sortField && direction === sortDirection) return;
    setSortField(field);
    setSortDirection(direction);
    setFetchedTickets([]);
  };

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <Icon />
          {activeField
            ? t('sort-active', {
                field: t(activeField.labelKey),
                defaultValue: 'Sort: {{field}}',
              })
            : t('sort', 'Sort')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-44 p-1">
        {TICKET_SORT_FIELDS.map((field) => (
          <TicketsSortOption
            key={field.value}
            label={t(field.labelKey)}
            selected={sortField === field.value}
            onClick={() => applySort(field.value, sortDirection)}
          />
        ))}
        <Separator className="my-1" />
        {TICKET_SORT_DIRECTIONS.map((direction) => (
          <TicketsSortOption
            key={direction.value}
            label={t(direction.labelKey, direction.label)}
            selected={sortDirection === direction.value}
            onClick={() => applySort(sortField, direction.value)}
          />
        ))}
      </Popover.Content>
    </PopoverScoped>
  );
};
