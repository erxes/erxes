import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useDeleteCategory } from '../hooks/useDeleteCategory';

export const CategoryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };
  const { toast } = useToast();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const categoryIds = selectedRows.map((row) => row.original._id);
  const selectedCount = categoryIds.length;
  const deleteCategory = useDeleteCategory();

  const onRemove = () => {
    confirm({
      message: `Are you sure you want to delete the ${selectedCount} selected categories?`,
      options: confirmOptions,
    }).then(() => {
      Promise.all(
        categoryIds.map((id) => deleteCategory({ variables: { id } })),
      )
        .then(() => {
          table.resetRowSelection();
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Categories deleted successfully',
          });
        })
        .catch((e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <CommandBar open={selectedCount > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedCount} selected</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={onRemove}
        >
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
