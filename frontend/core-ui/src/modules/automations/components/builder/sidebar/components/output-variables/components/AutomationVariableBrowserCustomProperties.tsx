import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationOutputPropertySourceFields } from './AutomationOutputPropertySourceFields';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';
import { useTranslation } from 'react-i18next';

export const AutomationVariableBrowserCustomProperties = () => {
  const { t } = useTranslation('automations');
  const {
    buildVariablePath,
    buildVariablePayload,
    buildVariableToken,
    mergedPropertySource,
    onInsertVariable,
    searchQuery,
  } = useAutomationVariableBrowserContext();

  return (
    <AutomationVariableBrowserSection title={t('sidebar-custom-properties')}>
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
        <AutomationVariableBrowserEmptyState
          text={t('sidebar-no-property-sources')}
        />
      )}
    </AutomationVariableBrowserSection>
  );
};
