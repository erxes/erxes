import { IconComponent, Input, cn } from 'erxes-ui';
import { AutomationOutputPropertySourceFields } from './components/AutomationOutputPropertySourceFields';
import { AutomationOutputVariableList } from './components/AutomationOutputVariableList';
import { AutomationVariableBrowserEmptyState } from './components/AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserInfoState } from './components/AutomationVariableBrowserInfoState';
import { AutomationVariableBrowserSection } from './components/AutomationVariableBrowserSection';
import { AutomationVariableSourceNodeList } from './components/AutomationVariableSourceNodeList';
import { TAutomationVariableBrowserProps } from './AutomationVariableBrowserTypes';
import { useAutomationVariableBrowser } from './hooks/useAutomationVariableBrowser';
import { AutomationNodeType } from '@/automations/types';

export type { TAutomationVariableSourceNode } from './AutomationVariableBrowserTypes';

export const AutomationVariableBrowser = ({
  sourceNode,
  sourceNodes,
  emptyState,
  onInsertVariable,
  sourceSectionTitle = 'Selected Node',
  className,
}: TAutomationVariableBrowserProps) => {
  const {
    activeSourceNode,
    buildVariablePath,
    buildVariablePayload,
    buildVariableToken,
    filteredVariables,
    loading,
    mergedPropertySources,
    searchQuery,
    searchValue,
    setSearchValue,
    setSelectedSourceNodeId,
  } = useAutomationVariableBrowser({ sourceNode, sourceNodes });
  if (!activeSourceNode) {
    if (!emptyState) {
      return null;
    }

    return (
      <div className={cn('space-y-3 px-3 py-2 text-sm', className)}>
        <AutomationVariableBrowserInfoState {...emptyState} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3 px-5 py-2 text-sm', className)}>
      {sourceNodes?.length ? (
        <AutomationVariableBrowserSection title="Variable Sources">
          <AutomationVariableSourceNodeList
            activeSourceNodeId={activeSourceNode.id}
            sourceNodes={sourceNodes}
            onSelectSourceNode={setSelectedSourceNodeId}
          />
        </AutomationVariableBrowserSection>
      ) : (
        <AutomationVariableBrowserSection title={sourceSectionTitle}>
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
        </AutomationVariableBrowserSection>
      )}

      {/* <AutomationVariableBrowserInfoState
        title="Insert variables"
        description="Click or drag variables into a supported field to insert placeholders."
      /> */}

      <Input
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder="Search variables..."
        className="h-9"
      />

      <AutomationVariableBrowserSection title="Output Variables">
        <AutomationOutputVariableList
          buildVariablePath={buildVariablePath}
          buildVariablePayload={buildVariablePayload}
          buildVariableToken={buildVariableToken}
          loading={loading}
          onInsertVariable={onInsertVariable}
          searchQuery={searchQuery}
          variables={filteredVariables}
        />
      </AutomationVariableBrowserSection>

      <AutomationVariableBrowserSection title="Custom Properties">
        {mergedPropertySources.length > 0 ? (
          <div className="space-y-2">
            {mergedPropertySources.map((source) => (
              <AutomationOutputPropertySourceFields
                key={`${source.key}-${source.propertyType}`}
                source={source}
                searchQuery={searchQuery}
                buildVariablePath={buildVariablePath}
                buildVariableToken={buildVariableToken}
                buildVariablePayload={buildVariablePayload}
                onInsertVariable={onInsertVariable}
              />
            ))}
          </div>
        ) : (
          <AutomationVariableBrowserEmptyState text="No property sources available." />
        )}
      </AutomationVariableBrowserSection>
    </div>
  );
};
