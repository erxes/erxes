import { AutomationAiAgentTableEmptyState } from '@/automations/components/settings/components/agents/components/AutomationAiAgentTableEmptyState';
import { automationAiAgentColumns } from '@/automations/components/settings/components/agents/components/automationAiAgentColumns';
import { useAiAgentsList } from '@/automations/components/settings/components/agents/hooks/useAiAgentsList';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { RecordTable } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const AutomationAiAgentRecordTable = () => {
  const { t } = useTranslation('automations');
  const { agents, loading, kind } = useAiAgentsList();
  const columns = useMemo(() => automationAiAgentColumns(t), [t]);
  const toCreateUrl = `${AutomationSettingsPath.AgentCreate}${
    kind ? `?kind=${kind}` : ''
  }`;

  return (
    <RecordTable.Provider
      columns={columns}
      data={agents}
      className="m-3 h-full min-w-0"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={8} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {!loading && agents.length === 0 && (
        <div className="flex min-h-[320px] min-w-0 items-center justify-center px-4 py-10 text-center">
          <AutomationAiAgentTableEmptyState toCreateUrl={toCreateUrl} />
        </div>
      )}
    </RecordTable.Provider>
  );
};
