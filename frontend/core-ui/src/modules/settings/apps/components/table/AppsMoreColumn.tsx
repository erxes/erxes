import { Cell } from '@tanstack/react-table';
import { RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconEdit, IconTrash, IconLock } from '@tabler/icons-react';
import { IApp } from '../../types';
import { useAppsRemove } from '../../hooks/useAppsRemove';
import { useAppsRevoke } from '../../hooks/useAppsRevoke';
import { useSetAtom } from 'jotai';
import { editingAppAtom } from '../../state';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AppsMoreColumnCell = ({ cell }: { cell: Cell<IApp, unknown> }) => {
  const { _id, name, status } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { appsRemove } = useAppsRemove();
  const { appsRevoke } = useAppsRevoke();
  const setEditingApp = useSetAtom(editingAppAtom);
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });

  const handleDelete = () => {
    confirm({
      message: t(
        'confirm-delete-name',
        'Are you sure you want to delete "{{name}}"?',
        { name },
      ),
    }).then(async () => {
      try {
        await appsRemove({ variables: { _id } });
      } catch (e: any) {
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRevoke = () => {
    confirm({
      message: t(
        'confirm-revoke-name',
        'Are you sure you want to revoke "{{name}}"?',
        { name },
      ),
    }).then(async () => {
      try {
        await appsRevoke({ variables: { _id } });
        toast({
          variant: 'success',
          title: t('app-revoked-successfully', 'App revoked successfully'),
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
              onSelect={() => setEditingApp(cell.row.original)}
            >
              <IconEdit /> {t('edit', 'Edit')}
            </Command.Item>
            {status === 'active' && (
              <Command.Item value="revoke" onSelect={handleRevoke}>
                <IconLock /> {t('revoke', 'Revoke')}
              </Command.Item>
            )}
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete', 'Delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const appsMoreColumn = {
  id: 'more',
  cell: AppsMoreColumnCell,
  size: 33,
};
