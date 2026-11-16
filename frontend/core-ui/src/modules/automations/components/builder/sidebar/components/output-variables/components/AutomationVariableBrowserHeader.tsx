import { IconComponent, cn } from 'erxes-ui';
import { ErrorBoundary } from 'react-error-boundary';
import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';
import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';
import { AutomationVariableSourceNodeList } from './AutomationVariableSourceNodeList';
import { getNodeColor } from '@/automations/utils/automationBuilderUtils/getNodeColor';

// Just the name, no picker or canvas-focus button: the fallback both for a
// single pseudo source and for a page with no canvas (`useReactFlow` needs
// one) to focus it on.
const AutomationVariableSourceNodeStatic = ({
  node,
}: {
  node: TAutomationVariableSourceNode;
}) => (
  <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3">
    {node.icon ? (
      <div className={cn('rounded-lg p-2', getNodeColor(node.nodeType))}>
        <IconComponent className="size-5" name={node.icon} />
      </div>
    ) : null}
    <div className="min-w-0">
      <div className="truncate font-medium text-foreground">{node.label}</div>
    </div>
  </div>
);

export const AutomationVariableBrowserHeader = () => {
  const {
    activeSourceNode,
    setSelectedSourceNodeId,
    sourceNodes,
    sourceSectionTitle,
  } = useAutomationVariableBrowserContext();

  if (!activeSourceNode) {
    return null;
  }

  return (
    <AutomationVariableBrowserSection title={sourceSectionTitle}>
      {sourceNodes.length ? (
        <ErrorBoundary
          fallback={
            <AutomationVariableSourceNodeStatic node={activeSourceNode} />
          }
        >
          <AutomationVariableSourceNodeList
            activeSourceNodeId={activeSourceNode.id}
            sourceNodes={sourceNodes}
            onSelectSourceNode={setSelectedSourceNodeId}
          />
        </ErrorBoundary>
      ) : (
        <AutomationVariableSourceNodeStatic node={activeSourceNode} />
      )}
    </AutomationVariableBrowserSection>
  );
};
