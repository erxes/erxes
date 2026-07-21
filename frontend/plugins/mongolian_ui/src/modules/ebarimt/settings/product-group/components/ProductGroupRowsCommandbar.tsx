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
          {table.getFilteredSelectedRowModel().rows.length} {t('selected', 'selected')}
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
      message: t('delete-product-groups-confirm', 'Are you sure you want to delete these product groups?'),
      options: {
        okLabel: t('delete', 'Delete'),
        cancelLabel: t('cancel', 'Cancel'),
      },
    }).then(() => {
      const productGroupIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeProductGroup({
        variables: { ids: productGroupIds },
        onError: (error: Error) => {
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: t('success', 'Success'),
            description: t('product-groups-deleted-successfully', 'Product groups deleted successfully'),
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      {t('delete', 'Delete')}
    </Button>
  );
};
