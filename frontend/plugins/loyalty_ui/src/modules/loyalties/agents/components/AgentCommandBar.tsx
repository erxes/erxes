import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IAgent } from '../types/agent';
import { AgentRemove } from './delete/AgentRemove';

export const AgentCommandBar = () => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel()
    .rows as Row<IAgent>[];
  const agentIds = selectedRows.map((row) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{t('selected-count', { count: selectedRows.length })}</CommandBar.Value>
        <Separator.Inline />
        <AgentRemove agentIds={agentIds} rows={selectedRows} />
      </CommandBar.Bar>
    </CommandBar>
  );
};
