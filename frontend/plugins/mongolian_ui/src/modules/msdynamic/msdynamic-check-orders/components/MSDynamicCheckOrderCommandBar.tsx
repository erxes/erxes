import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';

/** Songogdson orders deer check action gargana. */
export const MSDynamicCheckOrderCommandBar = ({
  checking,
  onCheck,
}: {
  checking: boolean;
  onCheck: (orderIds: string[]) => Promise<void>;
}) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  /** Selected order ids-aar check hiigeed selection tseverlene. */
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
        <Button variant="secondary" onClick={handleCheck} disabled={checking}>
          {checking ? 'Checking...' : 'Check'}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
