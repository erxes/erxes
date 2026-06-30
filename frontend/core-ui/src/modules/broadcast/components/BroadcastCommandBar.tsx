import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BroadcastDelete } from './commands/BroadcastDelete';
import { BroadcastSetLive } from './commands/BroadcastSetLive';

export const BroadcastCommandBar = () => {
  const { t } = useTranslation('broadcasts');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const broadcastIds = selectedRows.map((row: Row<any>) => row.original._id);

  const showSetLive =
    selectedRows.length === 1 && selectedRows[0].original.isDraft === true;

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected', '{{count}} selected', { count: selectedRows.length })}</CommandBar.Value>
        <Separator.Inline />
        <BroadcastDelete broadcastIds={broadcastIds} rows={selectedRows} />
        {showSetLive && (
          <BroadcastSetLive broadcastId={broadcastIds[0]} rows={selectedRows} />
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};
