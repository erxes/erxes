import { IconEdit } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { Can, ICustomer } from 'ui-modules';

export const CustomerMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICustomer, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const setOpen = (customerId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('contactId', customerId);
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

export const customerMoreColumn = {
  id: 'more',
  header: RecordTable.ColumnSelector,
  cell: CustomerMoreColumnCell,
  size: 33,
};
