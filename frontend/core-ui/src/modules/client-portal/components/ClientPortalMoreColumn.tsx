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
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const { _id, name } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeClientPortal } = useClientPortalRemove();

  const handleDelete = () => {
    if (!_id) {
      toast({
        title: t('error'),
        description: t('client-portal-id-missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: t('confirm-delete-named', { name }),
    }).then(async () => {
      try {
        await removeClientPortal([_id]);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('client-portal-deleted'),
        });
      } catch (e: any) {
        toast({
          title: t('error'),
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
                <IconEdit />
                {t('edit')}
              </Link>
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash />
              {t('delete')}
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
