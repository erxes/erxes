import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useProductRulesOnTaxRemove } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxRowsRemove';

export const ProductRulesOnTaxRowsCommandbar = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected', 'selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <ProductRulesOnTaxRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ProductRulesOnTaxRowsDelete = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeProductRulesOnTax, loading } = useProductRulesOnTaxRemove();

  const handleDelete = () => {
    confirm({
      message: t('delete-product-rules-on-tax-confirm', 'Are you sure you want to delete these product rules on tax?'),
      options: {
        okLabel: t('delete', 'Delete'),
        cancelLabel: t('cancel', 'Cancel'),
      },
    }).then(() => {
      const productRulesOnTaxIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeProductRulesOnTax({
        variables: { ids: productRulesOnTaxIds },
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
            description: t('product-rules-on-tax-deleted-successfully', 'Product rules on tax deleted successfully'),
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
