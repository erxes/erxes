import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
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
  const { updateTicket } = useUpdateTicket();

  return (
    <SelectPriorityTicket.Provider
      onValueChange={async (value) => {
        await Promise.all(
          ticketIds.map((ticketId) =>
            updateTicket({
              variables: {
                _id: ticketId,
                priority: value,
              },
            }),
          ),
        );
        setOpen(false);
      }}
    >
      <SelectPriorityTicket.Content />
    </SelectPriorityTicket.Provider>
  );
};
