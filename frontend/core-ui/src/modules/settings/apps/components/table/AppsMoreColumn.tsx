import { useTranslation } from 'react-i18next';
import { Cell } from '@tanstack/react-table';
import { RecordTable, useConfirm, useToast } from 'erxes-ui';
import { Popover, Command, Combobox } from 'erxes-ui';
import { IconTrash, IconLock } from '@tabler/icons-react';
import { IApp } from '../../types';
import { useAppsRemove } from '../../hooks/useAppsRemove';
import { useAppsRevoke } from '../../hooks/useAppsRevoke';
import { Can } from 'ui-modules';

export const AppsMoreColumnCell = ({ cell }: { cell: Cell<IApp, unknown> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const { _id, name, status } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { appsRemove } = useAppsRemove();
  const { appsRevoke } = useAppsRevoke();

  const handleDelete = () => {
    confirm({
      message: t('delete-confirm', {
        name,
      }),
    }).then(async () => {
      try {
        await appsRemove({ variables: { _id } });
      } catch (e: any) {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleRevoke = () => {
    confirm({
      message: t('revoke-confirm', {
        name,
      }),
    }).then(async () => {
      try {
        await appsRevoke({ variables: { _id } });
        toast({
          variant: 'success',
          title: t('app-revoked'),
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
      <Can action="appsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            {status === 'active' && (
              <Command.Item value="revoke" onSelect={handleRevoke}>
                <IconLock /> {t('revoke')}
              </Command.Item>
            )}
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
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
