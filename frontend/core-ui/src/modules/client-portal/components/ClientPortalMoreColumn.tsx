import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';

export const ClientPortalMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IClientPortal, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" asChild>
              <Link
                to={
                  '/' +
                  SettingsPath.Index +
                  SettingsWorkspacePath.ClientPortals +
                  '/' +
                  _id
                }
              >
                <IconEdit /> Edit
              </Link>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const clientPortalMoreColumn = {
  id: 'more',
  cell: ClientPortalMoreColumnCell,
  size: 33,
};
