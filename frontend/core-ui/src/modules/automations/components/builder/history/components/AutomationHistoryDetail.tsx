import { AutomationHistoryByFlow } from '@/automations/components/builder/history/components/AutomationHistoryByFlow';
import { AutomationHistoryByTable } from '@/automations/components/builder/history/components/AutomationHistoryByTable';
import { AutomationHistoryResultName } from '@/automations/components/builder/history/components/AutomationHistoryResultName';
import {
  AutomationExecutionDetailProvider,
  useAutomationExecutionDetail,
} from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import {
  AutomationHistoryDetailProvider,
  useAutomationHistoryDetail,
} from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import {
  IconArrowLeft,
  IconAutomaticGearbox,
  IconEye,
  IconTournament,
} from '@tabler/icons-react';
import {
  Button,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  Tabs,
} from 'erxes-ui';
import { useState } from 'react';

export const AutomationHistoryDetail = ({
  executionId,
}: {
  executionId: string;
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <AutomationHistoryDetailProvider executionId={executionId}>
      <RecordTableInlineCell>
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <Sheet.Trigger asChild>
            <RecordTable.MoreButton className="w-full h-full">
              <IconEye />
            </RecordTable.MoreButton>
          </Sheet.Trigger>
          <Sheet.View className="p-0 md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
            <AutomationHistorySheetContent isOpen={isOpen} />
          </Sheet.View>
        </Sheet>
      </RecordTableInlineCell>
    </AutomationHistoryDetailProvider>
  );
};

const AutomationHistorySheetHeader = () => {
  const { canGoBack, backToParentExecution } = useAutomationHistoryDetail();

  return (
    <Sheet.Header>
      <div className="flex min-w-0 items-center gap-2">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to parent execution"
            onClick={backToParentExecution}
          >
            <IconArrowLeft className="size-4" />
          </Button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <Sheet.Title>
              {canGoBack ? 'Workflow run' : 'Execution history'}
            </Sheet.Title>
          </div>
          <Sheet.Description>
            View the execution log of your automation in table or flow format.
          </Sheet.Description>
        </div>
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};

const AutomationHistorySheetResultName = () => {
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
export const AutomationHistorySheetContent = ({
  isOpen,
}: {
  isOpen: boolean;
}) => {
  if (!isOpen) {
    return null;
  }
  return (
    <AutomationExecutionDetailProvider>
      <AutomationHistorySheetHeader />
      <Sheet.Content>
        <Tabs defaultValue="table" className="h-full">
          <div className="w-full flex items-center justify-between p-2 border-b">
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
            <AutomationHistorySheetResultName />
          </div>
          <Tabs.Content value="flow" className="h-[calc(100%-36px)]">
            <AutomationHistoryByFlow />
          </Tabs.Content>

          <Tabs.Content value="table" className="h-[calc(100%-36px)]">
            <AutomationHistoryByTable />
          </Tabs.Content>
        </Tabs>
      </Sheet.Content>
    </AutomationExecutionDetailProvider>
  );
};
