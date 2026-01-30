import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { ICycle } from '../types';

export const CyclesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICycle, unknown>;
}) => {
  const navigate = useNavigate();
  const { _id, teamId } = cell.row.original;

  const handleEdit = (cycleId: string) => {
    navigate(`/operation/team/${teamId}/cycles/${cycleId}`);
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

export const cyclesMoreColumn = {
  id: 'more',
  cell: CyclesMoreColumnCell,
  size: 33,
};
