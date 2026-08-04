import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const TicketDelete = ({
  ticketIds,
  rows,
}: {
  ticketIds: string[];
  rows: Row<any>[];
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { removeTicket } = useTicketRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: t('confirm-delete-selected-tickets', { count: ticketIds.length }),
        }).then(async () => {
          try {
            await removeTicket(ticketIds);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: t('success'),
              variant: 'success',
              description: t('ticket-deleted-successfully'),
            });
          } catch (e: any) {
            toast({
              title: t('error'),
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
