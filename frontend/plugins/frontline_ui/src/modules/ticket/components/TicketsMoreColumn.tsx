import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { ticketDetailSheetState } from '../states/ticketDetailSheetState';
import { ITicket } from '../types';

import { useTicketRemove } from '../hooks/useRemoveTicket';

export const TicketsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITicket, unknown>;
}) => {
  const { t } = useTranslation('frontline');
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
      } catch (e: any) {
        toast({
          title: t('error'),
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
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
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
