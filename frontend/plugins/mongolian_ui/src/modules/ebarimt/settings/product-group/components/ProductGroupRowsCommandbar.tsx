import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  toast,
  useConfirm,
} from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useProductGroupRemove } from '@/ebarimt/settings/product-group/hooks/useProductGroupRowsRemove';

export const ProductGroupRowsCommandbar = () => {
  const { table } = RecordTable.useRecordTable();
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <ProductGroupRowsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ProductGroupRowsDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeProductGroup, loading } = useProductGroupRemove();

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete these product groups?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      const productGroupIds = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original._id);

      removeProductGroup({
        variables: { ids: productGroupIds },
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
            description: 'Product groups deleted successfully',
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
