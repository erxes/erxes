import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { IconChevronRight, IconUser } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useState } from 'react';
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
  assigneeIds,
}: {
  ticketIds: string[];
  assigneeIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();
  const [value, setValue] = useState<string[]>(assigneeIds);

  return (
    <SelectAssigneeTicket.Provider
      mode="multiple"
      value={value}
      allowUnassigned
      onValueChange={async (newValue) => {
        const newAssigneeIds = Array.isArray(newValue) ? newValue : [];
        const previousAssigneeIds = value;
        setValue(newAssigneeIds);
        await bulkUpdateTickets(
          ticketIds,
          { assigneeIds: newAssigneeIds },
          {
            successMessage: t('tickets-updated-successfully'),
            // The control holds one value for the whole selection, so it can
            // only go back when nothing was applied.
            onError: (failedIds) => {
              if (failedIds.length === ticketIds.length) {
                setValue(previousAssigneeIds);
              }
            },
          },
        );
      }}
    >
      <SelectAssigneeTicket.Content />
    </SelectAssigneeTicket.Provider>
  );
};
