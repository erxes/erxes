import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { IconAlertSquareRounded, IconChevronRight } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TicketsEditPriorityTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => setCurrentContent('priority')}
    >
      <div className="flex gap-2 items-center">
        <IconAlertSquareRounded className="size-4" />
        {t('change-priority')}
      </div>
      <IconChevronRight className="size-4 text-muted-foreground" />
    </Command.Item>
  );
};

export const TicketsEditPriorityContent = ({
  ticketIds,
  setOpen,
}: {
  ticketIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();

  return (
    <SelectPriorityTicket.Provider
      onValueChange={async (value) => {
        setOpen(false);
        await bulkUpdateTickets(
          ticketIds,
          { priority: value },
          { successMessage: t('tickets-updated-successfully') },
        );
      }}
    >
      <SelectPriorityTicket.Content />
    </SelectPriorityTicket.Provider>
  );
};
