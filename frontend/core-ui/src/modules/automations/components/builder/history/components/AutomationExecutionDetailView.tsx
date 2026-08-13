import { AutomationHistoryByFlow } from '@/automations/components/builder/history/components/AutomationHistoryByFlow';
import { AutomationHistoryByTable } from '@/automations/components/builder/history/components/AutomationHistoryByTable';
import { AutomationHistoryResultName } from '@/automations/components/builder/history/components/AutomationHistoryResultName';
import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
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

export const AutomationExecutionDetailTabs = () => (
  <Tabs defaultValue="table" className="h-full flex flex-col min-h-0">
    <div className="w-full flex flex-none items-center justify-between p-2 border-b">
      <Tabs.List variant="segment">
        <Tabs.Trigger value="table">
          <IconAutomaticGearbox />
          View as table
        </Tabs.Trigger>
        <Tabs.Trigger value="flow">
          <IconTournament className="scale-x-[-1]" />
          View as flow
        </Tabs.Trigger>
      </Tabs.List>
      <AutomationExecutionResultName />
    </div>
    <Tabs.Content value="flow" className="flex-1 min-h-0">
      <AutomationHistoryByFlow />
    </Tabs.Content>

    <Tabs.Content value="table" className="flex-1 min-h-0">
      <AutomationHistoryByTable />
    </Tabs.Content>
  </Tabs>
);
