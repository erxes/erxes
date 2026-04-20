import { Cell } from '@tanstack/react-table';
import {
  Popover,
  Command,
  Combobox,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconLock, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { Can } from 'ui-modules';
import { IOAuthClientApp } from '../../types';
import { editingOAuthClientAtom } from '../../state';
import { useOAuthClientsRemove } from '../../hooks/useOAuthClientsRemove';
import { useOAuthClientsRevoke } from '../../hooks/useOAuthClientsRevoke';

export const OAuthClientsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IOAuthClientApp, unknown>;
}) => {
  const { _id, name, status } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { oauthClientAppsRemove } = useOAuthClientsRemove();
  const { oauthClientAppsRevoke } = useOAuthClientsRevoke();
  const setEditingOAuthClient = useSetAtom(editingOAuthClientAtom);

  const handleDelete = () => {
    confirm({
      message: `Are you sure you want to delete "${name}"?`,
    }).then(async () => {
      try {
        await oauthClientAppsRemove({ variables: { _id } });
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRevoke = () => {
    confirm({
      message: `Are you sure you want to revoke "${name}"?`,
    }).then(async () => {
      try {
        await oauthClientAppsRevoke({ variables: { _id } });
        toast({
          variant: 'success',
          title: 'OAuth client revoked successfully',
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
      <Can action="appsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => setEditingOAuthClient(cell.row.original)}
            >
              <IconEdit /> Edit
            </Command.Item>
            {status === 'active' && (
              <Command.Item value="revoke" onSelect={handleRevoke}>
                <IconLock /> Revoke
              </Command.Item>
            )}
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const oauthClientsMoreColumn = {
  id: 'more',
  cell: OAuthClientsMoreColumnCell,
  size: 25,
};
