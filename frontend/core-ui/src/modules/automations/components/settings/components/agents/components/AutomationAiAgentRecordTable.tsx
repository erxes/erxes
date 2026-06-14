import { AutomationAiAgentTableEmptyState } from '@/automations/components/settings/components/agents/components/AutomationAiAgentTableEmptyState';
import { automationAiAgentColumns } from '@/automations/components/settings/components/agents/components/automationAiAgentColumns';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { IconPlus } from '@tabler/icons-react';
import { Button, RecordTable } from 'erxes-ui';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

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
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h2 className="text-sm font-medium">Configured agents</h2>
          <p className="text-sm text-muted-foreground">
            Pick an existing agent for editing or create a new one with the same
            provider contract.
          </p>
        </div>

        <Can action="automationsAiAgentAdd">
          <Button asChild className="shrink-0">
            <Link to={toCreateUrl}>
              <IconPlus className="size-4" />
              Create Agents
            </Link>
          </Button>
        </Can>
      </div>

      <RecordTable.Provider
        columns={automationAiAgentColumns}
        data={automationsAiAgents || []}
        className="h-full min-w-0"
      >
        <RecordTable.Scroll>
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && <RecordTable.RowSkeleton rows={8} />}
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
        {!loading && automationsAiAgents.length === 0 && (
          <div className="flex min-h-[320px] min-w-0 items-center justify-center px-4 py-10 text-center">
            <AutomationAiAgentTableEmptyState toCreateUrl={toCreateUrl} />
          </div>
        )}
      </RecordTable.Provider>
    </div>
  );
};
