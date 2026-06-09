import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';

export const useAutomationBuilderSecondarySidebar = () => {
  const { queryParams } = useAutomation();
  const { triggers, actions } = useAutomationNodes();
  const sourceNodes: TAutomationVariableSourceNode[] = [
    ...triggers.map((trigger) => ({
      id: trigger.id,
      type: trigger.type,
      nodeType: AutomationNodeType.Trigger,
      label: trigger.label,
      icon: trigger.icon,
    })),
    ...actions.map((action) => ({
      id: action.id,
      type: action.type,
      nodeType: AutomationNodeType.Action,
      label: action.label,
      icon: action.icon,
    })),
  ].filter((node) => node.id !== queryParams.activeNodeId);

  const emptyState = getEmptyState({
    hasSourceNodes: !!sourceNodes.length,
  });

  return {
    sourceNodes,
    emptyState,
  };
};

const getEmptyState = ({ hasSourceNodes }: { hasSourceNodes: boolean }) => {
  if (!hasSourceNodes) {
    return {
      title: 'No output variables yet',
      description:
        'Add a trigger or action to the workflow to browse its output variables here.',
    };
  }

  return null;
};
