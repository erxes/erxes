import { CommandBar, Separator } from 'erxes-ui';
import { RecordTable } from 'erxes-ui';
import { CategoriesDelete } from './delete/CategoriesDelete';

interface CategoriesCommandBarProps {
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}

export const CategoriesCommandBar = ({
  onBulkDelete,
}: CategoriesCommandBarProps) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row: any) => row.original._id as string,
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <CategoriesDelete
          selectedIds={selectedIds}
          selectedRows={selectedRows}
          onBulkDelete={onBulkDelete}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
