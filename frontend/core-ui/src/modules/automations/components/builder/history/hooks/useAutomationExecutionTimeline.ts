import { useAutomationExecutionDetail } from '@/automations/components/builder/history/context/AutomationExecutionDetailContext';
import { useAutomationHistoryDetail } from '@/automations/components/builder/history/context/AutomationHistoryDetailContext';
import { useAutomationExecutionSelection } from '@/automations/components/builder/history/context/AutomationExecutionSelectionContext';
import { useAutomationHistoryResult } from '@/automations/components/builder/history/hooks/useAutomationHistoryResult';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { buildExecutionTimeline } from '@/automations/utils/automationHistoryUtils/executionTimeline';
import { useMemo } from 'react';
import { IAutomationHistoryAction } from 'ui-modules';

export const useAutomationExecutionTimeline = () => {
  const { executionDetail } = useAutomationExecutionDetail();
  const { list, loading, refetch } = useAutomationHistoryResult();
  const { triggersConst } = useAutomation();

  // "Now" only moves when the run is read again, so open bars stay put
  // between re-renders instead of creeping.
  const now = useMemo(
    () => (executionDetail ? Date.now() : 0),
    [executionDetail],
  );

  const timeline = executionDetail
    ? buildExecutionTimeline(executionDetail, list, now)
    : undefined;

  const triggerIcon = triggersConst.find(
    ({ type }) => type === executionDetail?.triggerType,
  )?.icon;

  return { timeline, triggerIcon, loading, refetch };
};

export const useAutomationTimelineRow = (action: IAutomationHistoryAction) => {
  const { selectedActionId, selectAction } = useAutomationExecutionSelection();
  const { openChildExecution } = useAutomationHistoryDetail();
  const { actionsConst } = useAutomation();
  const childExecutionId: string | undefined =
    action.childExecutionId || action.result?.childExecutionId;

  return {
    isSelected: selectedActionId === action.actionId,
    select: () => selectAction(action.actionId),
    icon: actionsConst.find(({ type }) => type === action.actionType)?.icon,
    childExecutionId,
    openChild: () => childExecutionId && openChildExecution(childExecutionId),
  };
};
