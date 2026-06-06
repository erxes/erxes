import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { checkAutomationNodeSupportedSourceNode } from '../utils/automationSourceNode';

export const useAutomationBuilderSecondarySidebar = () => {
  const { selectedNode, queryParams } = useAutomation();
  const { id, nodeType } = selectedNode || {};
  const isSupportedSourceNode =
    checkAutomationNodeSupportedSourceNode(nodeType);

  const isAviableSourceNode =
    isSupportedSourceNode && id !== queryParams.activeNodeId;

  const sourceNode: TAutomationVariableSourceNode | null = isAviableSourceNode
    ? selectedNode
    : null;
  const isViewingCurrentNode = id === queryParams.activeNodeId;
  const emptyState = getEmptyState({
    hasSelectedNode: !!selectedNode,
    isViewingCurrentNode,
    isSupportedSourceNode,
  });

  return {
    sourceNode,
    emptyState,
  };
};

const getEmptyState = ({
  hasSelectedNode,
  isViewingCurrentNode,
  isSupportedSourceNode,
}: {
  hasSelectedNode: boolean;
  isViewingCurrentNode: boolean;
  isSupportedSourceNode: boolean;
}) => {
  if (!hasSelectedNode) {
    return {
      title: 'Select a source node',
      description:
        'Choose a trigger or previous action on the canvas to browse its output variables here.',
    };
  }

  if (isViewingCurrentNode) {
    return {
      title: 'Current node outputs are unavailable here',
      description:
        'This node cannot reference its own outputs. Select a different trigger or previous action to insert variables.',
    };
  }

  if (!isSupportedSourceNode) {
    return {
      title: 'Unsupported node selection',
      description:
        'Only trigger and action nodes can expose variables in this panel.',
    };
  }

  return null;
};
