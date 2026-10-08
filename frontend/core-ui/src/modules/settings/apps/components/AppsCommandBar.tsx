import { useTranslation } from 'react-i18next';
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

export const AppsCommandBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const { table } = RecordTable.useRecordTable();
  const { appsRemove } = useAppsRemove();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: t('remove-selected-confirm', { selectedCount: ids.length }),
      options: { confirmationValue: 'delete' },
    }).then(async () => {
      try {
        await Promise.all(
          ids.map((_id) =>
            appsRemove({
              variables: { _id },
              onError: (error) => {
                toast({
                  title: t('error'),
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
          {t('selected-count', {
            selectedCount: table.getFilteredSelectedRowModel().rows.length,
          })}
        </CommandBar.Value>
        <Can action="appsManage">
          <>
            <Separator.Inline />
            <Button variant="destructive" onClick={onRemove}>
              <IconTrash />
              {t('delete')}
            </Button>
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
