import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { IconChevronRight, IconProgressCheck } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TicketsEditStatusTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => setCurrentContent('status')}
    >
      <div className="flex gap-2 items-center">
        <IconProgressCheck className="size-4" />
        {t('change-status')}
      </div>
      <IconChevronRight className="size-4 text-muted-foreground" />
    </Command.Item>
  );
};

export const TicketsEditStatusContent = ({
  ticketIds,
  pipelineId,
  setOpen,
}: {
  ticketIds: string[];
  pipelineId: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();

  return (
    <SelectStatusTicket.Provider
      pipelineId={pipelineId}
      value=""
      onValueChange={async (value) => {
        setOpen(false);
        await bulkUpdateTickets(
          ticketIds,
          { statusId: value },
          { successMessage: t('tickets-updated-successfully') },
        );
      }}
    >
      <SelectStatusTicket.Content />
    </SelectStatusTicket.Provider>
  );
};
