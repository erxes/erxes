import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';

import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { ITicket } from '../types';
import { ticketDetailSheetState } from '../states/ticketDetailSheetState';

export const TicketsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ITicket, unknown>;
}) => {
  const [, setActiveTicket] = useAtom(ticketDetailSheetState);
  const { _id } = cell.row.original;

  const handleEdit = (ticketId: string) => {
    setActiveTicket(ticketId);
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
