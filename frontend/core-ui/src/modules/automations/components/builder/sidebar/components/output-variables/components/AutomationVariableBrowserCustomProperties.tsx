import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationOutputPropertySourceFields } from './AutomationOutputPropertySourceFields';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';

export const AutomationVariableBrowserCustomProperties = () => {
  const {
    buildVariablePath,
    buildVariablePayload,
    buildVariableToken,
    mergedPropertySource,
    onInsertVariable,
    searchQuery,
  } = useAutomationVariableBrowserContext();

  return (
    <AutomationVariableBrowserSection title="Custom Properties">
      {mergedPropertySource ? (
        <AutomationOutputPropertySourceFields
          source={mergedPropertySource}
          searchQuery={searchQuery}
          buildVariablePath={buildVariablePath}
          buildVariableToken={buildVariableToken}
          buildVariablePayload={buildVariablePayload}
          onInsertVariable={onInsertVariable}
        />
      ) : (
        <AutomationVariableBrowserEmptyState text="No property sources available." />
      )}
    </AutomationVariableBrowserSection>
  );
};
