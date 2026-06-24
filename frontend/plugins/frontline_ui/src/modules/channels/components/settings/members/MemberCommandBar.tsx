import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { MemberRemoveButtonCommandBar } from './MemberRemoveButton';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export const MemberCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { id: channelId } = useParams<{ id: string }>();

  const memberIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<any>) => row.original.memberId);

  const isSelected = table.getFilteredSelectedRowModel().rows.length > 0;
  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <MemberRemoveButtonCommandBar
          memberIds={memberIds}
          channelId={channelId || ''}
          rows={table.getFilteredSelectedRowModel().rows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
