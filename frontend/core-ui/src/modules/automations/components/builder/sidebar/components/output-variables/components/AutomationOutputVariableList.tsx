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
import { useTranslation } from 'react-i18next';

export const AutomationOutputVariableList = ({
  buildVariablePath,
  buildVariablePayload,
  buildVariableToken,
  loading,
  onInsertVariable,
  onInsertVariableAsLink,
  sourceNode,
  variables,
}: {
  buildVariablePath: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  buildVariableToken: (path: string) => string;
  loading: boolean;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  onInsertVariableAsLink?: (payload: TAutomationVariableDragPayload) => void;
  sourceNode: TAutomationVariableSourceNode;
  variables: TAutomationOutputVariable[];
}) => {
  const { t } = useTranslation('automations');
  if (loading) {
    return (
      <AutomationVariableBrowserLoadingState
        text={t('sidebar-loading-outputs')}
      />
    );
  }

  return (
    <AutomationVariableListProvider
      value={{
        buildVariablePath,
        buildVariablePayload,
        buildVariableToken,
        onInsertVariable,
        onInsertVariableAsLink,
        sourceNode,
      }}
    >
      <Command.List className="m-0 max-h-none overflow-visible [&_[cmdk-list-sizer]]:space-y-2">
        <Command.Empty>
          <AutomationVariableBrowserEmptyState
            text={
              variables.length
                ? t('sidebar-no-matching-output-variables')
                : t('sidebar-no-output-variables')
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
