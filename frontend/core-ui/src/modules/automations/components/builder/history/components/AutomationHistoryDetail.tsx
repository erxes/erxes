import {
  AutomationExecutionBackButton,
  AutomationExecutionDetailTabs,
  useAutomationExecutionDetailTitle,
} from '@/automations/components/builder/history/components/AutomationExecutionDetailView';
import { AutomationExecutionDetailProvider } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { AutomationHistoryDetailProvider } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { useAutomationHistoryView } from '@/automations/components/builder/history/hooks/useAutomationHistoryView';
import { IconEye } from '@tabler/icons-react';
import { cn, RecordTable, RecordTableInlineCell, Sheet } from 'erxes-ui';

export const AutomationHistoryDetail = ({
  executionId,
}: {
  executionId: string;
}) => {
  const { isSplitView, selectedExecutionId, selectExecution } =
    useAutomationHistoryView();
  const isOpen = selectedExecutionId === executionId;

  const trigger = (
    <RecordTable.MoreButton
      className="w-full h-full"
      aria-label="Show execution detail"
    >
      <IconEye className={cn(isOpen && 'text-primary')} />
    </RecordTable.MoreButton>
  );

  if (isSplitView) {
    return (
      <RecordTableInlineCell className="p-0">
        <span
          className="flex size-full"
          onClick={() => selectExecution(executionId)}
        >
          {trigger}
        </span>
      </RecordTableInlineCell>
    );
  }

  return (
    <AutomationHistoryDetailProvider executionId={executionId}>
      <RecordTableInlineCell className="p-0">
        <Sheet
          open={isOpen}
          onOpenChange={(open) => selectExecution(open ? executionId : null)}
        >
          <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>
          <Sheet.View className="p-0 md:w-[calc(100vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
            <AutomationHistorySheetContent isOpen={isOpen} />
          </Sheet.View>
        </Sheet>
      </RecordTableInlineCell>
    </AutomationHistoryDetailProvider>
  );
};

const AutomationHistorySheetHeader = () => {
  const title = useAutomationExecutionDetailTitle();

  return (
    <Sheet.Header>
      <div className="flex min-w-0 items-center gap-2">
        <AutomationExecutionBackButton />
        <div>
          <div className="flex items-center gap-2">
            <Sheet.Title>{title}</Sheet.Title>
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
        <AutomationExecutionDetailTabs />
      </Sheet.Content>
    </AutomationExecutionDetailProvider>
  );
};
