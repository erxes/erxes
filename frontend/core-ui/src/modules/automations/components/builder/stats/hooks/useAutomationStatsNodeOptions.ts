import { useAutomationStatsNodes } from '@/automations/components/builder/stats/context/AutomationStatsNodesContext';
import { useAutomationStatsNodeLabel } from '@/automations/components/builder/stats/hooks/useAutomationStatsNodeLabel';
import { useMemo } from 'react';

// Every action on the canvas, workflow members included, as a filter option
export const useAutomationStatsNodeOptions = () => {
  const { actions, workflows } = useAutomationStatsNodes();
  const getNodeLabel = useAutomationStatsNodeLabel();

  return useMemo(
    () =>
      [
        ...actions,
        ...workflows.flatMap(
          ({ actions: memberActions = [] }) => memberActions,
        ),
      ].map(({ id, type }) => ({
        value: id,
        label: getNodeLabel({ actionId: id, actionType: type }).label,
      })),
    [actions, workflows, getNodeLabel],
  );
};
