import { IconEdit } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';
import { Can } from 'ui-modules';
import { ICPUser } from '@/contacts/client-portal-users/types/cpUser';

/** Renders row actions for a client portal user record. */
export const ClientPortalUserMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICPUser, unknown>;
}) => {
  const [, setCpUserId] = useQueryState<string>('cpUserId');
  const { _id } = cell.row.original;
  const editMenuItem = (
    <Command.Item value="edit" onSelect={() => setCpUserId(_id)}>
      <IconEdit /> Edit
    </Command.Item>
  );
  const commandList = <Command.List>{editMenuItem}</Command.List>;
  const command = <Command shouldFilter={false}>{commandList}</Command>;

  return (
    <Popover>
      <Can action="clientPortalManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>{command}</Combobox.Content>
    </Popover>
  );
};

export const clientPortalUserMoreColumn: ColumnDef<ICPUser> = {
  id: 'more',
  header: RecordTable.ColumnSelector,
  cell: ClientPortalUserMoreColumnCell,
  size: 33,
};
