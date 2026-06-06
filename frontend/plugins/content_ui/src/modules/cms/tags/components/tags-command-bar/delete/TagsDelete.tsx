import { Button, toast } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { IconTrash } from '@tabler/icons-react';

export const TagsDelete = ({
  selectedIds,
  selectedRows,
  onBulkDelete,
}: {
  selectedIds: string[];
  selectedRows: any[];
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}) => {
  const { confirm } = useConfirm();
  return (
    <Button
      variant="secondary"
      className="text-destructive"
      size="sm"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${selectedIds.length} selected tags?`,
        }).then(async () => {
          try {
            await onBulkDelete(selectedIds);
            selectedRows.forEach((row: any) => row.toggleSelected(false));
            toast({ title: 'Success', variant: 'default' });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e?.message || 'Failed to delete tags',
              variant: 'destructive',
            });
          }
        })
      }
    >
      <IconTrash className="mr-2 h-4 w-4" /> Delete
    </Button>
  );
};
