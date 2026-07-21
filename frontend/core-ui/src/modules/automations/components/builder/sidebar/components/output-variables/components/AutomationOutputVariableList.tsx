import { useTranslation } from 'react-i18next';
import { TAutomationVariableDragPayload } from 'ui-modules';
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
  searchQuery,
  sourceNode,
  variables,
}: {
  buildVariablePath: (path: string) => string;
  buildVariablePayload: TAutomationVariablePayloadBuilder;
  buildVariableToken: (path: string) => string;
  loading: boolean;
  onInsertVariable?: (payload: TAutomationVariableDragPayload) => void;
  searchQuery: string;
  sourceNode: TAutomationVariableSourceNode;
  variables: TAutomationOutputVariable[];
}) => {
  const { t } = useTranslation('automations');
  if (loading) {
    return (
      <AutomationVariableBrowserLoadingState
        text={t('loading-outputs', 'Loading outputs...')}
      />
    );
  }

  if (variables.length === 0) {
    return (
      <AutomationVariableBrowserEmptyState
        text={
          searchQuery
            ? t('no-matching-output-variables', 'No matching output variables.')
            : t('no-output-variables-available', 'No output variables available.')
        }
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
        sourceNode,
      }}
    >
      <div className="space-y-2">
        {variables.map((variable) => (
          <AutomationOutputVariableItem
            key={variable.key}
            variable={variable}
          />
        ))}
      </div>
    </AutomationVariableListProvider>
  );
};
