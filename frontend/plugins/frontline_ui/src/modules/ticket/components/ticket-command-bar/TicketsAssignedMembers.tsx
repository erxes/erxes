import { SelectAssignedMembersTicket } from '@/ticket/components/ticket-selects/SelectAssignedMembersTicket';
import { useBulkUpdateTickets } from '@/ticket/hooks/useBulkUpdateTickets';
import { IconChevronRight, IconUsersGroup } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TicketsAssignedMembersTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command.Item
      className="flex justify-between"
      onSelect={() => setCurrentContent('assignedMembers')}
    >
      <div className="flex gap-2 items-center">
        <IconUsersGroup className="size-4" />
        {t('change-assigned-members')}
      </div>
      <IconChevronRight className="size-4 text-muted-foreground" />
    </Command.Item>
  );
};

export const TicketsAssignedMembersContent = ({
  ticketIds,
  assignedMembers,
}: {
  ticketIds: string[];
  assignedMembers: string[];
}) => {
  const { t } = useTranslation('frontline');
  const { bulkUpdateTickets } = useBulkUpdateTickets();
  const [value, setValue] = useState<string[]>(assignedMembers);

  return (
    <SelectAssignedMembersTicket.Provider
      mode="multiple"
      value={value}
      onValueChange={async (newValue) => {
        const memberIds = Array.isArray(newValue) ? newValue : [];
        const previousMemberIds = value;
        setValue(memberIds);
        await bulkUpdateTickets(
          ticketIds,
          { assignedMembers: memberIds },
          {
            successMessage: t('tickets-updated-successfully'),
            onError: () => setValue(previousMemberIds),
          },
        );
      }}
    >
      <SelectAssignedMembersTicket.Content />
    </SelectAssignedMembersTicket.Provider>
  );
};
