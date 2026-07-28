import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ILottery } from '@/loyalties/lotteries/types/lottery';
import { LotteryRemove } from './delete/LotteryRemove';

export const LotteryCommandBar = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel()
    .rows as Row<ILottery>[];
  const lotteryIds = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected-count', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <LotteryRemove lotteryIds={lotteryIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
