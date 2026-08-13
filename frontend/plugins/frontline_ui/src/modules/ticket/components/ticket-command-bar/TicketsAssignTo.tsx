import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { IconChevronRight, IconUser } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TicketsAssignToTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => setCurrentContent('assignee')}
    >
      <div className="flex gap-2 items-center">
        <IconUser className="size-4" />
        {t('assign-to')}
      </div>
      <IconChevronRight className="size-4 text-muted-foreground" />
    </Command.Item>
  );
};

export const TicketsAssignToContent = ({
  ticketIds,
  setOpen,
}: {
  ticketIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();

  return (
    <SelectAssigneeTicket.Provider
      mode="multiple"
      value={[]}
      allowUnassigned
      onValueChange={async (value) => {
        setOpen(false);
        await bulkUpdateTickets(
          ticketIds,
          { assigneeIds: Array.isArray(value) ? value : value ? [value] : [] },
          { successMessage: t('tickets-updated-successfully') },
        );
      }}
    >
      <SelectAssigneeTicket.Content />
    </SelectAssigneeTicket.Provider>
  );
};
