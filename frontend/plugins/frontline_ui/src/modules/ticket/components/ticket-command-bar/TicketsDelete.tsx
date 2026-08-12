import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Command, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ITicket } from '@/ticket/types';

export const TicketsDelete = ({
  ticketIds,
  rows,
  setOpen,
}: {
  ticketIds: string[];
  rows: Row<ITicket>[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { removeTicket } = useTicketRemove();
  const { toast } = useToast();

  const handleDelete = () => {
    setOpen(false);
    confirm({
      message: t('confirm-delete-selected-tickets', {
        count: ticketIds.length,
      }),
    }).then(async () => {
      try {
        await removeTicket(ticketIds);
        rows.forEach((row) => row.toggleSelected(false));
        toast({
          title: t('success'),
          variant: 'success',
          description: t('ticket-deleted-successfully'),
        });
      } catch (e) {
        toast({
          title: t('error'),
          description: e instanceof Error ? e.message : String(e),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Command.Item className="text-destructive" onSelect={handleDelete}>
      <IconTrash className="size-4" />
      {t('delete')}
    </Command.Item>
  );
};
