import { useClientPortalRemove } from '@/client-portal/hooks/useClientPortalRemove';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { Can } from 'ui-modules';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const ClientPortalMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IClientPortal, unknown>;
}) => {
  const { t } = useTranslation('client-portal');
  const { _id, name } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeClientPortal } = useClientPortalRemove();

  const handleDelete = () => {
    if (!_id) {
      toast({
        title: t('error', 'Error'),
        description: t('client-portal-id-missing', 'Client portal ID is missing'),
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
          title: t('success', 'Success'),
          variant: 'success',
          description: t('client-portal-deleted-successfully', 'Client portal deleted successfully'),
        });
      } catch (e: any) {
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover>
      <Can action="clientPortalManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
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
                <IconEdit /> {t('edit', 'Edit')}
              </Link>
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete', 'Delete')}
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
