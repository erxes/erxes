import { ApolloError } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useRemoveElements } from '../hooks/useRemoveElements';

export const ElementCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };
  const { toast } = useToast();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const elementIds = selectedRows.map((row) => row.original._id);
  const selectedCount = elementIds.length;
  const { removeElements, loading } = useRemoveElements();

  const onRemove = () => {
    confirm({
      message: `Are you sure you want to delete the ${selectedCount} selected elements?`,
      options: confirmOptions,
    }).then(() => {
      removeElements(elementIds)
        .then(() => {
          table.resetRowSelection();
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Elements deleted successfully',
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
          disabled={loading}
          onClick={onRemove}
        >
          {loading ? <Spinner /> : <IconTrash />}
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
