import { AutomationHistoryFlow } from '@/automations/components/builder/history/components/flow/AutomationHistoryFlow';
import { AutomationHistoryByTable } from '@/automations/components/builder/history/components/AutomationHistoryByTable';
import { AutomationHistoryResultName } from '@/automations/components/builder/history/components/AutomationHistoryResultName';
import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { AutomationErrorEmptyState } from '@/automations/components/common/AutomationErrorEmptyState';
import { AutomationExecutionResultPanel } from '@/automations/components/builder/history/components/result/AutomationExecutionResultPanel';
import { AutomationExecutionSelectionProvider } from '@/automations/components/builder/history/context/AutomationExecutionSelectionContext';
import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import {
  IconArrowLeft,
  IconAutomaticGearbox,
  IconTournament,
} from '@tabler/icons-react';
import { Button, Tabs } from 'erxes-ui';

export const AutomationExecutionBackButton = () => {
  const { canGoBack, backToParentExecution } = useAutomationHistoryDetail();

  if (!canGoBack) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Back to parent execution"
      onClick={backToParentExecution}
    >
      <IconArrowLeft className="size-4" />
    </Button>
  );
};

export const useAutomationExecutionDetailTitle = () => {
  const { canGoBack } = useAutomationHistoryDetail();

  return canGoBack ? 'Workflow run' : 'Execution history';
};

const AutomationExecutionResultName = () => {
  const { executionDetail } = useAutomationExecutionDetail();

  if (!executionDetail) {
    return null;
  }

  return (
    <div>
      <AutomationHistoryResultName executionDetail={executionDetail} />
    </div>
  );
};

export const AutomationExecutionDetailTabs = () => {
  const { error, refetch } = useAutomationExecutionDetail();

  if (error) {
    return (
      <AutomationErrorEmptyState
        title="Couldn't load this run"
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <AutomationExecutionSelectionProvider>
      <Tabs defaultValue="table" className="h-full flex flex-col min-h-0">
        <div className="w-full flex flex-none items-center justify-between p-2 border-b">
          <Tabs.List variant="segment" className="h-8 p-0.5">
            <Tabs.Trigger
              value="table"
              className="h-7 gap-1.5 px-2.5 text-xs [&>svg]:size-3.5"
            >
              <IconAutomaticGearbox />
              Table
            </Tabs.Trigger>
            <Tabs.Trigger
              value="flow"
              className="h-7 gap-1.5 px-2.5 text-xs [&>svg]:size-3.5"
            >
              <IconTournament className="scale-x-[-1]" />
              Flow
            </Tabs.Trigger>
          </Tabs.List>
          <AutomationExecutionResultName />
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <Tabs.Content value="flow" className="flex-1 min-h-0">
              <AutomationHistoryFlow />
            </Tabs.Content>

            <Tabs.Content value="table" className="flex-1 min-h-0">
              <AutomationHistoryByTable />
            </Tabs.Content>
          </div>

          <AutomationExecutionResultPanel />
        </div>
      </Tabs>
    </AutomationExecutionSelectionProvider>
  );
};
