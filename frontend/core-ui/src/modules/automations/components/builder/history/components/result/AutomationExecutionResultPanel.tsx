import { WorkflowExecutionResultCell } from '@/automations/components/builder/history/components/WorkflowExecutionResultCell';
import { HistoryFlowStatusBadge } from '@/automations/components/builder/history/components/flow/HistoryFlowStatusBadge';
import { ExecutionActionResult } from '@/automations/components/builder/history/components/result/ExecutionActionResult';
import { useAutomationExecutionResultPanel } from '@/automations/components/builder/history/hooks/useAutomationExecutionResultPanel';
import { IconX } from '@tabler/icons-react';
import { Button, ScrollArea, Separator, Skeleton } from 'erxes-ui';
import { Suspense } from 'react';

/**
 * The one place an action result is read in full. Both history views select
 * into it, so no result ever has to open a popover or a dialog of its own.
 */
export const AutomationExecutionResultPanel = () => {
  const {
    action,
    actionStatus,
    createdAtLabel,
    durationLabel,
    executionStatus,
    isWorkflowAction,
    label,
    onClose,
  } = useAutomationExecutionResultPanel();

  if (!action) {
    return null;
  }

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l bg-background">
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <HistoryFlowStatusBadge status={actionStatus} />
            <span className="truncate text-sm font-medium">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {createdAtLabel} · {durationLabel}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close result panel"
          onClick={onClose}
        >
          <IconX className="size-4" />
        </Button>
      </div>
      <Separator />
      {/* Radix lays the viewport out as a table, which grows with unbreakable
          text like URLs and widens the whole panel */}
      <ScrollArea
        className="min-h-0 flex-1"
        viewportClassName="[&>div]:!block [&>div]:min-w-0"
      >
        <div className="min-w-0 p-3 text-sm">
          {isWorkflowAction ? (
            <WorkflowExecutionResultCell action={action} />
          ) : (
            // Action results load their renderer lazily; without this the
            // nearest boundary is the route's, which blanks the whole page
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <ExecutionActionResult action={action} status={executionStatus} />
            </Suspense>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
