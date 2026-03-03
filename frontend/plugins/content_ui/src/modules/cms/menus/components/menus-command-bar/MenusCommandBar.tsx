import { CommandBar, Separator, Button, RecordTable, toast } from 'erxes-ui';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';

interface MenusCommandBarProps {
  onBulkDelete: (ids: string[]) => Promise<void>;
}

export const MenusCommandBar = ({ onBulkDelete }: MenusCommandBarProps) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((row: any) => row.original._id as string);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          className="text-destructive"
          size="sm"
          onClick={() =>
            confirm({
              message: `Are you sure you want to delete the ${selectedIds.length} selected menus?`,
            }).then(async () => {
              try {
                await onBulkDelete(selectedIds);
                selectedRows.forEach((row: any) => row.toggleSelected(false));
                toast({ title: 'Success', variant: 'default' });
              } catch (e: any) {
                toast({
                  title: 'Error',
                  description: e?.message || 'Failed to delete menus',
                  variant: 'destructive',
                });
              }
            })
          }
        >
          Delete
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
