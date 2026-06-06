import { Cell } from '@tanstack/table-core';
import { ICPUser } from '../types/cpUser';
import { useSearchParams } from 'react-router-dom';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { Can } from 'ui-modules';
import { CommandItem, CommandList } from 'cmdk';
import { IconEdit } from '@tabler/icons-react';

export const ClientPortalUserMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICPUser, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const setOpen = (clientId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('cpUserId', clientId);
    newSearchParams.set('tab', 'overview');
    setSearchParams(newSearchParams);
  };

  return (
    <Popover>
      <Can action="contactsUpdate">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <CommandList>
            <CommandItem value="edit" onSelect={() => setOpen(_id)}>
              <IconEdit /> Edit
            </CommandItem>
          </CommandList>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const clientPortalUserMoreColumn = {
  id: 'more',
  header: RecordTable.ColumnSelector,
  cell: ClientPortalUserMoreColumnCell,
  size: 33,
};
