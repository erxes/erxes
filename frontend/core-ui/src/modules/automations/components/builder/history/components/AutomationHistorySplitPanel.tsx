import {
  AutomationExecutionBackButton,
  AutomationExecutionDetailTabs,
  useAutomationExecutionDetailTitle,
} from '@/automations/components/builder/history/components/AutomationExecutionDetailView';
import { AutomationExecutionDetailProvider } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { AutomationHistoryDetailProvider } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { AutomationHistorySplitDirectionToggle } from '@/automations/components/builder/history/components/AutomationHistoryViewOptions';
import { useAutomationHistoryView } from '@/automations/components/builder/history/hooks/useAutomationHistoryView';
import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

const AutomationHistorySplitPanelHeader = () => {
  const { selectExecution } = useAutomationHistoryView();
  const title = useAutomationExecutionDetailTitle();

  return (
    <div className="flex h-12 flex-none items-center gap-2 border-b bg-background px-3">
      <AutomationExecutionBackButton />
      <h3 className="flex-auto truncate text-sm font-semibold">{title}</h3>
      <AutomationHistorySplitDirectionToggle />
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close execution detail"
        onClick={() => selectExecution(null)}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );
};

export const AutomationHistorySplitPanel = ({
  executionId,
}: {
  executionId: string;
}) => (
  <AutomationHistoryDetailProvider key={executionId} executionId={executionId}>
    <AutomationExecutionDetailProvider>
      <div className="flex h-full min-h-0 flex-col bg-background">
        <AutomationHistorySplitPanelHeader />
        <div className="flex-1 min-h-0">
          <AutomationExecutionDetailTabs />
        </div>
      </div>
    </AutomationExecutionDetailProvider>
  </AutomationHistoryDetailProvider>
);
