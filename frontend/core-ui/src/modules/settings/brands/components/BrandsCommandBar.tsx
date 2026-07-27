import { IconTrash } from '@tabler/icons-react';

import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
  useToast,
} from 'erxes-ui';
import { useBrandsRemove } from '../hooks/useBrandsRemove';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const BrandsCommandBar = () => {
  const { t } = useTranslation('settings');
  const { table } = RecordTable.useRecordTable();
  const { brandsRemove } = useBrandsRemove();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const confirmOptions = { confirmationValue: 'delete' };

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: `Are you sure you want to remove the selected(${ids?.length})?`,
      options: confirmOptions,
    }).then(async () => {
      try {
        brandsRemove({
          variables: {
            ids,
          },
          onError: (error) => {
            toast({
              title: t('error', 'Error'),
              description: error.message,
              variant: 'destructive',
            });
          },
        });
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected', 'selected')}
        </CommandBar.Value>
        <Can action="brandsDelete">
          <>
            <Separator.Inline />
            <Button variant="secondary" onClick={onRemove}>
              <IconTrash />
              {t('delete', 'Delete')}
            </Button>
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
