import { Cell } from '@tanstack/react-table';
import { RecordTable, useConfirm, useToast } from 'erxes-ui';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { useClientPortalRemove } from '@/client-portal/hooks/useClientPortalRemove';

export const ClientPortalMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IClientPortal, unknown>;
}) => {
  const { _id, name } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeClientPortal } = useClientPortalRemove();

  const handleDelete = () => {
    if (!_id) {
      toast({
        title: 'Error',
        description: 'Client portal ID is missing',
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: `Are you sure you want to delete "${name}"?`,
    }).then(async () => {
      try {
        await removeClientPortal([_id]);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Client portal deleted successfully',
        });
      } catch (e: any) {
        toast({
          title: 'Error',
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
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
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
  size: 15,
};
