import { AutomationNodeType } from '@/automations/types';
import { IconComponent, cn } from 'erxes-ui';
import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';
import { AutomationVariableSourceNodeList } from './AutomationVariableSourceNodeList';

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
        <AutomationVariableSourceNodeList
          activeSourceNodeId={activeSourceNode.id}
          sourceNodes={sourceNodes}
          onSelectSourceNode={setSelectedSourceNodeId}
        />
      ) : (
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3">
          {activeSourceNode.icon ? (
            <div
              className={cn('rounded-lg p-2', {
                'bg-primary/10 text-primary':
                  activeSourceNode.nodeType === AutomationNodeType.Trigger,
                'bg-success/10 text-success':
                  activeSourceNode.nodeType === AutomationNodeType.Action,
              })}
            >
              <IconComponent
                className="size-5"
                name={activeSourceNode.icon}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">
              {activeSourceNode.label}
            </div>
          </div>
        </div>
      )}
    </AutomationVariableBrowserSection>
  );
};
