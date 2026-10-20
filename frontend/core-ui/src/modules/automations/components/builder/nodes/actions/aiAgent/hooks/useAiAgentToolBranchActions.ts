import { useAiAgentActionContext } from '@/automations/components/builder/nodes/actions/aiAgent/context/AiAgentActionProvider';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getConnectedNextActions } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useMemo } from 'react';
import { TAutomationOptionalConnect } from 'ui-modules';

// Plugin actions wired behind a tool on the canvas — the ones whose output
// the agent can keep in long-term memory.
export const useAiAgentToolBranchActions = (toolId?: string) => {
  const { actionId } = useAiAgentActionContext();
  const { actions } = useAutomationNodes();
  const { actionFolks } = useAutomation();

  return useMemo(() => {
    const branchStartId = actions
      .find(({ id }) => id === actionId)
      ?.config?.optionalConnects?.find(
        ({ optionalConnectId }: TAutomationOptionalConnect) =>
          optionalConnectId === toolId,
      )?.actionId;

    if (!toolId || !branchStartId) {
      return [];
    }

    return getConnectedNextActions(branchStartId, actions, actionFolks).filter(
      ({ type }) => type.includes(':'),
    );
  }, [actionId, actions, actionFolks, toolId]);
};
