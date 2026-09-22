import { Cell } from '@tanstack/table-core';
import { IAdjustClosing } from '../types/AdjustClosing';
import { useSearchParams } from 'react-router';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';

export const AdjustClosingMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAdjustClosing, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const setOpen = (adjustClosingId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('adjustClosingId', adjustClosingId);
    setSearchParams(newSearchParams);
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => setOpen(_id)}>
              <IconEdit /> Edit
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const AdjustClosingMoreColumn = {
  id: 'more',
  cell: AdjustClosingMoreColumnCell,
  size: 33,
};
