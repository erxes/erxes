import { useAutomationRunLabels } from '@/automations/hooks/useAutomationRunLabels';
import { automationRecentRunsAtomFamily } from '@/automations/states/automationRecentRunsState';
import { automationHistorySelectedExecutionState } from '@/automations/states/automationState';
import { AutomationBuilderTabsType } from '@/automations/types';
import { getAutomationRunHealth } from '@/automations/utils/automationRunHealth';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAutomationRecentRunsStrip = (automationId: string) => {
  const runs = useAtomValue(automationRecentRunsAtomFamily(automationId));
  const setSelectedExecution = useSetAtom(
    automationHistorySelectedExecutionState,
  );
  const navigate = useNavigate();
  const labels = useAutomationRunLabels();

  const health = useMemo(() => getAutomationRunHealth(runs), [runs]);

  // Oldest on the left, so the strip reads like a timeline
  const timeline = useMemo(() => [...(runs || [])].reverse(), [runs]);

  const openRun = (executionId: string) => {
    setSelectedExecution({ automationId, executionId });
    navigate(
      `/automations/edit/${automationId}?activeTab=${AutomationBuilderTabsType.History}`,
    );
  };

  return {
    isLoaded: runs !== undefined,
    timeline,
    health,
    openRun,
    ...labels,
  };
};
