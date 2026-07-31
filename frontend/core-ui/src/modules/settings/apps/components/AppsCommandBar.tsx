import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
  useToast,
} from 'erxes-ui';
import { useAppsRemove } from '../hooks/useAppsRemove';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AppsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { appsRemove } = useAppsRemove();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: t('confirm-remove-selected', {
        count: ids.length,
        defaultValue_one: 'Are you sure you want to remove the selected app?',
        defaultValue_other:
          'Are you sure you want to remove the {{count}} selected apps?',
      }),
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      try {
        await Promise.all(
          ids.map((_id) =>
            appsRemove({
              variables: { _id },
              onError: (error) => {
                toast({
                  title: t('error', 'Error'),
                  description: error.message,
                  variant: 'destructive',
                });
              },
            }),
          ),
        );
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', '{{count}} selected', {
            count: table.getFilteredSelectedRowModel().rows.length,
          })}
        </CommandBar.Value>
        <Can action="appsManage">
          <>
            <Separator.Inline />
            <Button variant="destructive" onClick={onRemove}>
              <IconTrash />
              {t('delete', 'Delete')}
            </Button>
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
