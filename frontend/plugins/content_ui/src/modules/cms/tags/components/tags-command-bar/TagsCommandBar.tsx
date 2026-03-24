import { CommandBar, Separator } from 'erxes-ui';
import { RecordTable } from 'erxes-ui';
import { TagsDelete } from './delete/TagsDelete';

interface TagsCommandBarProps {
  onBulkDelete: (ids: string[]) => Promise<void> | void;
}

export const TagsCommandBar = ({ onBulkDelete }: TagsCommandBarProps) => {
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
        <TagsDelete
          selectedIds={selectedIds}
          selectedRows={selectedRows}
          onBulkDelete={onBulkDelete}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
