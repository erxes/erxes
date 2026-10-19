import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationStatsNode } from '@/automations/types';
import { useCallback } from 'react';

/** Resolves a stats actionId back to the node label shown on the canvas. */
export const useAutomationStatsNodeLabel = () => {
  const { actions, workflows } = useAutomationNodes();
  const { actionsConst } = useAutomation();

  return useCallback(
    ({
      actionId,
      actionType,
    }: Pick<TAutomationStatsNode, 'actionId' | 'actionType'>) => {
      const node =
        actions.find(({ id }) => id === actionId) ??
        workflows
          .flatMap(({ actions: memberActions = [] }) => memberActions)
          .find(({ id }) => id === actionId);

      const typeLabel = actionsConst.find(
        ({ type }) => type === (node?.type || actionType),
      )?.label;

      return {
        label: node?.label || typeLabel || actionType || actionId,
        typeLabel: typeLabel || node?.type || actionType,
        isRemoved: !node,
      };
    },
    [actions, workflows, actionsConst],
  );
};
