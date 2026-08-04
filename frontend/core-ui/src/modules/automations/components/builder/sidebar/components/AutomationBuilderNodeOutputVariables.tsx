import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { useAutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondarySidebar';
import { useAutomationVariableInsertion } from 'ui-modules';

export const AutomationBuilderNodeOutputVariables = () => {
  const { sourceNodes, emptyState } = useAutomationBuilderSecondarySidebar();
  const { insertVariable } = useAutomationVariableInsertion();

  return (
    <AutomationVariableBrowser
      sourceNodes={sourceNodes}
      emptyState={emptyState}
      onInsertVariable={insertVariable}
      sourceSectionTitle="Nodes"
    />
  );
};
