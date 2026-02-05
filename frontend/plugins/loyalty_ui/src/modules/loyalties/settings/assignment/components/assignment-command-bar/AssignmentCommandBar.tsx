import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { DeleteAssignment } from './delete/DeleteAssignment';

export const AssignmentCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <DeleteAssignment
          assignmentIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
