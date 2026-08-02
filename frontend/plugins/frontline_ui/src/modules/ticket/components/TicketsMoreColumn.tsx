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

/** Renders the action items within the ticket row popover. */
const TicketActionsList = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Command.List>
      <Command.Item value="edit" onSelect={onEdit}>
        <IconEdit /> {t('edit')}
      </Command.Item>
      <Command.Item value="delete" onSelect={onDelete}>
        <IconTrash /> {t('delete')}
      </Command.Item>
    </Command.List>
  );
};

/** Renders edit and delete actions for a ticket record-table row. */
export const TicketsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITicket, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const [, setActiveTicket] = useTicketDetailSheet();
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTicket } = useTicketRemove();

  /** Opens the selected ticket in the detail sheet. */
  const handleEdit = () => {
    setActiveTicket(_id);
  };

  /** Confirms and removes the selected ticket. */
  const handleDelete = () => {
    if (!_id) {
      toast({
        title: t('error'),
        description: t('ticket-id-missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: t('confirm-delete-ticket'),
    }).then(async () => {
      try {
        await removeTicket([_id]);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('ticket-deleted-successfully'),
        });
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
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
          <TicketActionsList onEdit={handleEdit} onDelete={handleDelete} />
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const ticketsMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: TicketsMoreColumnCell,
  size: 33,
};
