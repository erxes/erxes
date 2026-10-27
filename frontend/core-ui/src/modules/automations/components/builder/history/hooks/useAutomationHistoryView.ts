import {
  automationHistorySplitDirectionState,
  automationHistoryViewModeState,
} from '@/automations/states/automationState';
import { useQueryState } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';
import { AUTOMATION_HISTORY_PANEL } from '../historyPanel';
import {
  AutomationHistorySplitDirection,
  AutomationHistoryViewMode,
} from '@/automations/types';
import { useAtom } from 'jotai';
import { useCallback } from 'react';

export const useAutomationHistoryView = () => {
  const [storedViewMode, setViewMode] = useAtom(automationHistoryViewModeState);
  const viewMode =
    storedViewMode === AutomationHistoryViewMode.Split
      ? AutomationHistoryViewMode.Split
      : AutomationHistoryViewMode.Panel;
  const [splitDirection, setSplitDirection] = useAtom(
    automationHistorySplitDirectionState,
  );
  const panel = useSidePanel();
  const historyPath = getModulePanelPath(AUTOMATION_HISTORY_PANEL);
  const isSplitView =
    viewMode === AutomationHistoryViewMode.Split &&
    panel.path !== historyPath &&
    !panel.history.includes(historyPath);
  const [selectedExecutionId, setSelectedExecutionId] =
    useQueryState<string>('executionId');

  const selectExecution = useCallback(
    (executionId: string | null) => {
      setSelectedExecutionId(executionId);
      if (executionId && !isSplitView) panel.openPath(historyPath);
    },
    [setSelectedExecutionId, isSplitView, panel, historyPath],
  );

  const changeViewMode = useCallback(
    (mode: AutomationHistoryViewMode) => setViewMode(mode),
    [setViewMode],
  );

  return {
    viewMode,
    isSplitView,
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
