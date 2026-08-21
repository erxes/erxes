import {
  automationHistorySelectedExecutionState,
  automationHistorySplitDirectionState,
  automationHistoryViewModeState,
} from '@/automations/states/automationState';
import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  AutomationHistorySplitDirection,
  AutomationHistoryViewMode,
} from '@/automations/types';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

export const useAutomationHistoryView = () => {
  const [viewMode, setViewMode] = useAtom(automationHistoryViewModeState);
  const [splitDirection, setSplitDirection] = useAtom(
    automationHistorySplitDirectionState,
  );
  const { detail } = useAutomation();
  const automationId = detail?._id || '';
  const [selection, setSelection] = useAtom(
    automationHistorySelectedExecutionState,
  );

  const selectedExecutionId =
    selection?.automationId === automationId ? selection.executionId : null;

  const selectExecution = useCallback(
    (executionId: string | null) =>
      setSelection(executionId ? { automationId, executionId } : null),
    [automationId, setSelection],
  );

  const changeViewMode = useCallback(
    (mode: AutomationHistoryViewMode) => setViewMode(mode),
    [setViewMode],
  );

  return {
    viewMode,
    isSplitView: viewMode === AutomationHistoryViewMode.Split,
    changeViewMode,
    splitDirection,
    setSplitDirection,
    isVerticalSplit:
      splitDirection === AutomationHistorySplitDirection.Vertical,
    selectedExecutionId,
    selectExecution,
  };
};

/**
 * Cells without their own popover open the execution in split view when
 * clicked; title/description keep their popovers, so they stay untouched.
 */
export const useSelectExecutionCellProps = (executionId: string) => {
  const { isSplitView, selectExecution } = useAutomationHistoryView();

  const onClick = useCallback(
    () => selectExecution(executionId),
    [selectExecution, executionId],
  );

  if (!isSplitView) {
    return {};
  }

  return { onClick, className: 'cursor-pointer' };
};
