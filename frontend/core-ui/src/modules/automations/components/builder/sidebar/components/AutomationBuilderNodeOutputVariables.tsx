import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { useAutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondarySidebar';
import { useAutomationVariableInsertion } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderNodeOutputVariables = () => {
  const { t } = useTranslation('automations');
  const { sourceNodes, emptyState } = useAutomationBuilderSecondarySidebar();
  const { insertVariable } = useAutomationVariableInsertion();

  return (
    <AutomationVariableBrowser
      sourceNodes={sourceNodes}
      emptyState={emptyState}
      onInsertVariable={insertVariable}
      sourceSectionTitle={t('sidebar-nodes')}
    />
  );
};
