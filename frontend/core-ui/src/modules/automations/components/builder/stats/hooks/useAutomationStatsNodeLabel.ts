import { useAutomationStatsNodes } from '@/automations/components/builder/stats/context/AutomationStatsNodesContext';
import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import {
  ConstantsQueryResponse,
  TAutomationStatsNode,
} from '@/automations/types';
import { useQuery } from '@apollo/client';
import { useCallback } from 'react';

/** Resolves a stats actionId back to the node label shown on the canvas. */
export const useAutomationStatsNodeLabel = () => {
  const { actions, workflows } = useAutomationStatsNodes();
  const { data } = useQuery<ConstantsQueryResponse>(AUTOMATION_CONSTANTS, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
  });
  const actionsConst = data?.automationConstants?.actionsConst;

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

      const typeLabel = actionsConst?.find(
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
