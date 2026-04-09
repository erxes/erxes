import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/components/AutomationVariableBrowser';

export const useAutomationBuilderSecondarySidebar = () => {
  const { selectedNode, queryParams } = useAutomation();
  const isSupportedSourceNode =
    !!selectedNode &&
    (selectedNode.nodeType === AutomationNodeType.Trigger ||
      selectedNode.nodeType === AutomationNodeType.Action);
  const sourceNode: TAutomationVariableSourceNode | null =
    isSupportedSourceNode && selectedNode.id !== queryParams.activeNodeId
      ? selectedNode
      : null;
  const isViewingCurrentNode =
    !!selectedNode && selectedNode.id === queryParams.activeNodeId;
  const emptyState = !selectedNode
    ? {
        title: 'Select a source node',
        description:
          'Choose a trigger or previous action on the canvas to browse its output variables here.',
      }
    : isViewingCurrentNode
      ? {
          title: 'Current node outputs are unavailable here',
          description:
            'This node cannot reference its own outputs. Select a different trigger or previous action to insert variables.',
        }
      : !isSupportedSourceNode
        ? {
            title: 'Unsupported node selection',
            description:
              'Only trigger and action nodes can expose variables in this panel.',
          }
        : null;

  return {
    sourceNode,
    emptyState,
  };
};
