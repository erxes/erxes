import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { IconArrowsSplit2 } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useCallback } from 'react';
import { IAutomationHistoryAction } from 'ui-modules';
import { useTranslation } from 'react-i18next';

// Result cell for workflow node actions: input values summary + in-place
// drill-down into the child execution (same sheet, back stack) — a nested
// sheet would fight the parent modal over focus/pointer locks.
export const WorkflowExecutionResultCell = ({
  action,
}: {
  action: IAutomationHistoryAction;
}) => {
  const { t } = useTranslation('automations');
  const { openChildExecution } = useAutomationHistoryDetail();

  const childExecutionId =
    action.childExecutionId || action.result?.childExecutionId;
  const inputs: Record<string, unknown> = action.result?.inputs || {};
  const inputNames = Object.keys(inputs);
  const errorText = action.result?.error;

  const handleOpenChild = useCallback(() => {
    if (childExecutionId) {
      openChildExecution(childExecutionId);
    }
  }, [openChildExecution, childExecutionId]);

  return (
    <div className="flex w-full items-center gap-3 px-2 py-1">
      {childExecutionId ? (
        <Button variant="outline" size="sm" onClick={handleOpenChild}>
          <IconArrowsSplit2 className="size-4" />
          {t('history-view-workflow-run')}
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">
          {t('history-child-execution-not-recorded')}
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
            {t('history-inputs-summary', {
              count: inputNames.length,
              names: inputNames.join(', '),
            })}
          </span>
        )
      )}
    </div>
  );
};
