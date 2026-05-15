import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';
import { AutomationVariableSourceNodeCard } from './AutomationVariableSourceNodeCard';

export const AutomationVariableSourceNodeList = ({
  activeSourceNodeId,
  sourceNodes,
  onSelectSourceNode,
}: {
  activeSourceNodeId: string;
  sourceNodes: TAutomationVariableSourceNode[];
  onSelectSourceNode: (nodeId: string) => void;
}) => {
  return (
    <div className="space-y-2">
      {sourceNodes.map((node) => (
        <AutomationVariableSourceNodeCard
          key={node.id}
          node={node}
          isSelected={node.id === activeSourceNodeId}
          onClick={() => onSelectSourceNode(node.id)}
        />
      ))}
    </div>
  );
};
