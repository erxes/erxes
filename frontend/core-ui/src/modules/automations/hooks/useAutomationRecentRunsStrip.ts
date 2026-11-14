import { useAutomationRunLabels } from '@/automations/hooks/useAutomationRunLabels';
import { useOpenAutomationRun } from '@/automations/hooks/useOpenAutomationRun';
import { automationRecentRunsAtomFamily } from '@/automations/states/automationRecentRunsState';
import { getAutomationRunHealth } from '@/automations/utils/automationRunHealth';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export const useAutomationRecentRunsStrip = (automationId: string) => {
  const runs = useAtomValue(automationRecentRunsAtomFamily(automationId));
  const openAutomationRun = useOpenAutomationRun();
  const labels = useAutomationRunLabels();

  const health = useMemo(() => getAutomationRunHealth(runs), [runs]);

  // Oldest on the left, so the strip reads like a timeline
  const timeline = useMemo(() => [...(runs || [])].reverse(), [runs]);

  return {
    isLoaded: runs !== undefined,
    timeline,
    health,
    openRun: (executionId: string) =>
      openAutomationRun(automationId, executionId),
    ...labels,
  };
};
