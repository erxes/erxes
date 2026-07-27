import { useTranslation } from 'react-i18next';
import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationOutputPropertySourceFields } from './AutomationOutputPropertySourceFields';
import { AutomationVariableBrowserEmptyState } from './AutomationVariableBrowserEmptyState';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';

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
    <AutomationVariableBrowserSection
      title={t('custom-properties', 'Custom Properties')}
    >
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
          text={t(
            'no-property-sources-available',
            'No property sources available.',
          )}
        />
      )}
    </AutomationVariableBrowserSection>
  );
};
