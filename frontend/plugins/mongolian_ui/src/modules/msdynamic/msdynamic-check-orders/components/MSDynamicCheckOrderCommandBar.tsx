import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useMSDynamicCheckOrder } from '../hooks/useMSDynamicCheckOrder';

export const CheckSyncedOrdersCommandBar = ({
  onCheck,
}: {
  onCheck: (orderIds: string[]) => Promise<void>;
}) => {
  const { loading } = useMSDynamicCheckOrder();
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleCheck = async () => {
    const selectedIds = selectedRows
      .map((row) => row.original._id)
      .filter(Boolean);
    await onCheck(selectedIds);
    table.resetRowSelection();
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <Button variant="secondary" onClick={handleCheck} disabled={loading}>
          {loading ? 'Checking...' : 'Check'}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
