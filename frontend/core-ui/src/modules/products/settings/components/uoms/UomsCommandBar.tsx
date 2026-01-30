import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useUomsRemove } from '../../hooks/useUomsRemove';
import { ApolloError } from '@apollo/client';

export const UomsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeUoms } = useUomsRemove();

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: `Are you sure you want to delete the ${
        selectedIds.length
      } selected UOM${selectedIds.length === 1 ? '' : 's'}?`,
    }).then(() => {
      removeUoms({
        variables: { uomIds: selectedIds },
        onCompleted: () => {
          toast({
            title: 'UOMs deleted successfully',
            variant: 'success',
          });
          table.resetRowSelection();
        },
        onError: (e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
        >
          <IconTrash />
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
