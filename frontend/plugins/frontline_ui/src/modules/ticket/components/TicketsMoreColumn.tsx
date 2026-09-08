import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTicketDetailSheet } from '../hooks/useTicketDetailSheet';
import { ITicket } from '../types';

import { useTicketRemove } from '../hooks/useRemoveTicket';

function TicketActionsList({
  onEdit,
  onDelete,
}: Readonly<{
  onEdit: () => void;
  onDelete: () => void;
}>) {
  const { t } = useTranslation('frontline');

  return (
    <Command.List>
      <Command.Item value="edit" onSelect={onEdit}>
        <IconEdit /> {t('edit', 'Edit')}
      </Command.Item>
      <Command.Item value="delete" onSelect={onDelete}>
        <IconTrash /> {t('delete', 'Delete')}
      </Command.Item>
    </Command.List>
  );
}

export function TicketsMoreColumnCell({
  cell,
}: Readonly<{
  cell: Cell<ITicket, unknown>;
}>) {
  const { t } = useTranslation('frontline');
  const [, setActiveTicket] = useTicketDetailSheet();
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTicket } = useTicketRemove();

  function handleEdit() {
    setActiveTicket(_id);
  }

  function handleDelete() {
    if (!_id) {
      toast({
        title: t('error', 'Error'),
        description: t('ticket-id-missing', 'Ticket ID is missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: t(
        'confirm-delete-ticket',
        'Are you sure you want to delete this ticket?',
      ),
    }).then(async () => {
      try {
        await removeTicket([_id]);
        toast({
          title: t('success', 'Success!'),
          variant: 'success',
          description: t(
            'ticket-deleted-successfully',
            'Ticket deleted successfully',
          ),
        });
      } catch (error: unknown) {
        toast({
          title: t('error', 'Error'),
          description:
            error instanceof Error
              ? error.message
              : t('something-went-wrong', 'Uh oh! Something went wrong.'),
          variant: 'destructive',
        });
      }
    });
  }
  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <TicketActionsList onEdit={handleEdit} onDelete={handleDelete} />
        </Command>
      </Combobox.Content>
    </Popover>
  );
}

export const ticketsMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TicketsMoreColumnCell,
  size: 33,
};
