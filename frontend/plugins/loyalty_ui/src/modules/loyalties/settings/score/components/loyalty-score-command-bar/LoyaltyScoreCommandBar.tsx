import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { LoyaltyScoreDelete } from './delete/LoyaltyScoreDelete';

export const LoyaltyScoreCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <LoyaltyScoreDelete
          scoreIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
