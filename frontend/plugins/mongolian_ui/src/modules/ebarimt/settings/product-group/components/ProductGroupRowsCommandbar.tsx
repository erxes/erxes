import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useProductGroupRowsRemove } from '@/ebarimt/settings/product-group/hooks/useProductGroupRowsRemove';
import { useTranslation } from 'react-i18next';

export const ProductGroupRowsCommandbar = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <ProductGroupRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ProductGroupRowsDelete = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeProductGroup, loading } = useProductGroupRowsRemove();

  const handleDelete = () => {
    confirm({
      message: t('delete-product-groups-confirm'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const productGroupIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeProductGroup({
        variables: { ids: productGroupIds },
        onError: (error: Error) => {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: t('success'),
            description: t('product-groups-deleted-successfully'),
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete')}
    </Button>
  );
};
