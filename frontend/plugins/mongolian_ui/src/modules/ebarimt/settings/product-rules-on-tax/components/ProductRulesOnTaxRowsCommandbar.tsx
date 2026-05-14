import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useProductRulesOnTaxRemove } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxRowsRemove';

export const ProductRulesOnTaxRowsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ProductRulesOnTaxRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ProductRulesOnTaxRowsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeProductRulesOnTax, loading } = useProductRulesOnTaxRemove();

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete these product rules on tax?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const productRulesOnTaxIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeProductRulesOnTax({
        variables: { ids: productRulesOnTaxIds },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          table.setRowSelection({});
          toast({
            title: 'Success',
            description: 'Product rules on tax deleted successfully',
          });
        },
      });
    });
  };

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Delete
    </Button>
  );
};
