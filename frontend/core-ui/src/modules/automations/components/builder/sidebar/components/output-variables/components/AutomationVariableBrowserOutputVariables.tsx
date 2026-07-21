import { Command } from 'erxes-ui';
import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationOutputVariableList } from './AutomationOutputVariableList';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';

export const AutomationVariableBrowserOutputVariables = () => {
  const {
    activeSourceNode,
    buildVariablePath,
    buildVariablePayload,
    buildVariableToken,
    loading,
    mergedVariables,
    onInsertVariable,
    searchValue,
    setSearchValue,
  } = useAutomationVariableBrowserContext();

  if (!activeSourceNode) {
    return null;
  }

  return (
    <Command
      className="h-auto gap-3 overflow-visible bg-transparent"
      shouldFilter
    >
      <Command.Input
        value={searchValue}
        onValueChange={setSearchValue}
        placeholder="Search variables..."
        className="h-9"
        wrapperClassName="rounded-md border"
      />

      <AutomationVariableBrowserSection title="Output Variables">
        <AutomationOutputVariableList
          buildVariablePath={buildVariablePath}
          buildVariablePayload={buildVariablePayload}
          buildVariableToken={buildVariableToken}
          loading={loading}
          onInsertVariable={onInsertVariable}
          sourceNode={activeSourceNode}
          variables={mergedVariables}
        />
      </AutomationVariableBrowserSection>
    </Command>
  );
};
