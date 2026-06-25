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
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
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
      message: t('delete-product-rules-on-tax-confirm'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      const productRulesOnTaxIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeProductRulesOnTax({
        variables: { ids: productRulesOnTaxIds },
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
            description: t('product-rules-on-tax-deleted-successfully'),
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
