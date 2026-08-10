import { Button, Popover, PopoverScoped } from 'erxes-ui';
import { IconSortDescending } from '@tabler/icons-react';
import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { ticketSortAtom } from '@/ticket/states/ticketSortState';
import { fetchedTicketsState } from '@/ticket/states/fetchedTicketState';
import { TICKET_SORT_FIELDS } from '@/ticket/hooks/useGetTickets';

export const TicketsSortControl = () => {
  const { t } = useTranslation('frontline');
  const [isOpen, setIsOpen] = useState(false);
  const [sortField, setSortField] = useAtom(ticketSortAtom);
  const setFetchedTickets = useSetAtom(fetchedTicketsState);

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconSortDescending />
          {t('sort')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-44 p-1">
        {TICKET_SORT_FIELDS.map((field) => (
          <Button
            key={field.value}
            variant={sortField === field.value ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => {
              setSortField(field.value);
              setFetchedTickets([]);
              setIsOpen(false);
            }}
          >
            {field.label}
          </Button>
        ))}
      </Popover.Content>
    </PopoverScoped>
  );
};
