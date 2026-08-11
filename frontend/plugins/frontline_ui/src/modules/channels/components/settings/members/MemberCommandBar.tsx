import { IChannelMember } from '@/channels/types';
import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MemberRemoveButtonCommandBar } from './MemberRemoveButton';

export const MemberCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { id: channelId } = useParams<{ id: string }>();

  const rows = table.getFilteredSelectedRowModel()
    .rows as Row<IChannelMember>[];

  return (
    <CommandBar open={rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {t('n-selected', {
            defaultValue: '{{count}} selected',
            count: rows.length,
          })}
        </CommandBar.Value>
        <Separator.Inline />
        <MemberRemoveButtonCommandBar
          memberIds={rows.map((row) => row.original.memberId)}
          channelId={channelId || ''}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
