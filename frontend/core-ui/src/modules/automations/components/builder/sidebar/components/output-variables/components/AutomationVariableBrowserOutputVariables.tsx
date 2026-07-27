import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAutomationVariableBrowserContext } from '../context/AutomationVariableBrowserContext';
import { AutomationOutputVariableList } from './AutomationOutputVariableList';
import { AutomationVariableBrowserSection } from './AutomationVariableBrowserSection';

export const AutomationVariableBrowserOutputVariables = () => {
  const { t } = useTranslation('automations');
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
        placeholder={t('search-variables', 'Search variables...')}
        className="h-9"
        wrapperClassName="rounded-md border"
      />

      <AutomationVariableBrowserSection
        title={t('output-variables', 'Output Variables')}
      >
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
