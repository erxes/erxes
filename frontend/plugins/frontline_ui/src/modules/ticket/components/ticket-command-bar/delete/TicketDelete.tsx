import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';
import { IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, useConfirm, useToast } from 'erxes-ui';

export const TicketDelete = ({
  ticketIds,
  rows,
}: {
  ticketIds: string[];
  rows: Row<any>[];
}) => {
  const { confirm } = useConfirm();
  const { removeTicket } = useTicketRemove();

  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${ticketIds.length} selected Ticket?`,
        }).then(async () => {
          try {
            await removeTicket(ticketIds);
            rows.forEach((row) => {
              row.toggleSelected(false);
            });
            toast({
              title: 'Success',
              variant: 'success',
              description: 'Ticket deleted successfully',
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message,
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
