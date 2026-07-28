import { TAutomationVariableDragPayload } from 'ui-modules';
import { Command } from 'erxes-ui';
import {
  TAutomationOutputVariable,
  TAutomationVariablePayloadBuilder,
  TAutomationVariableSourceNode,
} from '../AutomationVariableBrowserTypes';
import { AutomationVariableListProvider } from '../context/AutomationVariableListContext';
import { AutomationOutputVariableItem } from './AutomationOutputVariableItem';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserLoadingState } from './AutomationVariableBrowserLoadingState';

export const AutomationOutputVariableList = ({
  buildVariablePath,
  buildVariablePayload,
  buildVariableToken,
  loading,
  onInsertVariable,
  sourceNode,
  variables,
}: {
  buildVariablePath: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  buildVariableToken: (path: string) => string;
  loading: boolean;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  sourceNode: TAutomationVariableSourceNode;
  variables: TAutomationOutputVariable[];
}) => {
  if (loading) {
    return <AutomationVariableBrowserLoadingState text="Loading outputs..." />;
  }

  return (
    <AutomationVariableListProvider
      value={{
        buildVariablePath,
        buildVariablePayload,
        buildVariableToken,
        onInsertVariable,
        sourceNode,
      }}
    >
      <Command.List className="m-0 max-h-none overflow-visible [&_[cmdk-list-sizer]]:space-y-2">
        <Command.Empty>
          <AutomationVariableBrowserEmptyState
            text={
              variables.length
                ? 'No matching output variables.'
                : 'No output variables available.'
            }
          />
        </Command.Empty>
        {variables.map((variable) => (
          <AutomationOutputVariableItem
            key={variable.key}
            variable={variable}
          />
        ))}
      </Command.List>
    </AutomationVariableListProvider>
  );
};
