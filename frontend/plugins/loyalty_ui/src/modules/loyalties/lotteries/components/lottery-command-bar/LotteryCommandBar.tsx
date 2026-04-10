import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { ILottery } from '@/loyalties/lotteries/types/lottery';
import { LotteryRemove } from './delete/LotteryRemove';

export const LotteryCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows as Row<ILottery>[];
  const lotteryIds = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />
        <LotteryRemove lotteryIds={lotteryIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
