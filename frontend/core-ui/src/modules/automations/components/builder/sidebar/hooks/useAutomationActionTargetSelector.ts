import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useQueryState } from 'erxes-ui';
import { useActionTarget } from '@/automations/components/builder/nodes/hooks/useActionTarget';

export const useAutomationActionTargetSelector = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const [activeNodeId] = useQueryState<string>('activeNodeId');

  const configFieldNamePrefix: `actions.${number}` = `${AutomationNodesType.Actions}.${activeNode.nodeIndex}`;
  const { actionConstMap } = useAutomation();
  const { actions, triggers } = useAutomationNodes();
  const { actionsCanBeTarget } = useActionTarget({
    actionId: activeNodeId ?? undefined,
    targetActionId: actions.find((a) => a.id === activeNodeId)?.targetActionId,
  });

  const { allowTargetFromActions = false } =
    actionConstMap.get(activeNode.type) || {};

  const trigger = activeNodeId
    ? getTriggerOfAction(activeNodeId, actions, triggers)
    : undefined;

  const list: Array<{
    type: 'trigger' | 'action';
    id: string;
    label: string;
    nodeType: string;
    icon?: string;
  }> = [];

  if (trigger) {
    list.push({
      type: 'trigger',
      id: trigger.id,
      label: `${trigger.label} (Trigger)`,
      nodeType: trigger.type,
      icon: trigger.icon,
    });
  }

  for (const action of actionsCanBeTarget) {
    if (action.id !== activeNodeId) {
      list.push({
        type: 'action',
        id: action.id,
        label: action.label || action.type,
        nodeType: action.type,
        icon: action.icon,
      });
    }
  }

  return {
    list,
    allowTargetFromActions,
    configFieldNamePrefix,
  };
};
