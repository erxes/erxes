import { AutomationAiAgentTableEmptyState } from '@/automations/components/settings/components/agents/components/AutomationAiAgentTableEmptyState';
import { automationAiAgentColumns } from '@/automations/components/settings/components/agents/components/automationAiAgentColumns';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { IconPlus } from '@tabler/icons-react';
import { Button, RecordTable } from 'erxes-ui';
import { Link } from 'react-router';

export const AutomationAiAgentRecordTable = ({
  kind,
}: {
  kind?: string | null;
}) => {
  const { automationsAiAgents, loading } = useAiAgents(kind);

  const toCreateUrl = `/settings/automations/agents/create${
    kind ? `?kind=${kind}` : ''
  }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">Configured agents</h2>
          <p className="text-sm text-muted-foreground">
            Pick an existing agent for editing or create a new one with the same
            provider contract.
          </p>
        </div>

        <Button asChild>
          <Link to={toCreateUrl}>
            <IconPlus className="size-4" />
            Create Agent
          </Link>
        </Button>
      </div>

      <RecordTable.Provider
        columns={automationAiAgentColumns}
        data={automationsAiAgents || []}
        className="h-full"
      >
        <RecordTable.Scroll>
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={8} />}
              <RecordTable.RowList />
              {!loading && automationsAiAgents.length === 0 && (
                <tr className="h-[320px]">
                  <td colSpan={6} className="py-10 text-center">
                    <div className="mt-4">
                      <AutomationAiAgentTableEmptyState
                        toCreateUrl={toCreateUrl}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
};
