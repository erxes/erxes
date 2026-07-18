import { AutomationHistorySheetContent } from '@/automations/components/builder/history/components/AutomationHistoryDetail';
import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { AutomationHistoryDetailProvider } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { IconArrowsSplit2 } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { IAutomationHistoryAction } from 'ui-modules';

// Opens a nested execution-history sheet for a workflow's child execution.
export const AutomationChildExecutionSheet = ({
  childExecutionId,
}: {
  childExecutionId: string;
}) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <AutomationHistoryDetailProvider executionId={childExecutionId}>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button variant="outline" size="sm">
            <IconArrowsSplit2 className="size-4" />
            View workflow run
          </Button>
        </Sheet.Trigger>
        <Sheet.View className="p-0 md:w-[calc(96vw-theme(spacing.4))] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-screen-2xl">
          <AutomationHistorySheetContent isOpen={isOpen} />
        </Sheet.View>
      </Sheet>
    </AutomationHistoryDetailProvider>
  );
};

// Result cell for workflow node actions: input values summary + drill-in.
// Rendered directly in the row (not inside the value popover) so the nested
// sheet survives the popover closing.
export const WorkflowExecutionResultCell = ({
  action,
}: {
  action: IAutomationHistoryAction;
}) => {
  const childExecutionId =
    action.childExecutionId || action.result?.childExecutionId;
  const inputs: Record<string, unknown> = action.result?.inputs || {};
  const inputNames = Object.keys(inputs);
  const errorText = action.result?.error;

  return (
    <div className="flex w-full items-center gap-3 px-2 py-1">
      {childExecutionId ? (
        <AutomationChildExecutionSheet childExecutionId={childExecutionId} />
      ) : (
        <span className="text-xs text-muted-foreground">
          Child execution not recorded
        </span>
      )}
      {errorText ? (
        <span className="min-w-0 truncate text-xs text-destructive">
          {stringifyAutomationHistoryValue(errorText)}
        </span>
      ) : (
        inputNames.length > 0 && (
          <span
            className="min-w-0 truncate font-mono text-xs text-muted-foreground"
            title={inputNames
              .map(
                (name) =>
                  `${name}: ${stringifyAutomationHistoryValue(inputs[name])}`,
              )
              .join('\n')}
          >
            {inputNames.length} input{inputNames.length > 1 ? 's' : ''}:{' '}
            {inputNames.join(', ')}
          </span>
        )
      )}
    </div>
  );
};
