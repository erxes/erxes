import { Cell } from '@tanstack/react-table';
import { RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { ITicket } from '../types';
import { ticketDetailSheetState } from '../states/ticketDetailSheetState';

import { useTicketRemove } from '../hooks/useRemoveTicket';

export const TicketsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITicket, unknown>;
}) => {
  const [, setActiveTicket] = useAtom(ticketDetailSheetState);
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTicket } = useTicketRemove();

  const handleEdit = (ticketId: string) => {
    setActiveTicket(ticketId);
  };
  const handleDelete = () => {
    if (!_id) {
      toast({
        title: 'Error',
        description: 'Ticket ID is missing',
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: 'Are you sure you want to delete this ticket?',
    }).then(async () => {
      try {
        await removeTicket([_id]);
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
    });
  };
  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => handleEdit(_id)}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const ticketsMoreColumn = {
  id: 'more',
  cell: TicketsMoreColumnCell,
  size: 33,
};
