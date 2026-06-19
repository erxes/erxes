import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { useAutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondarySidebar';

export const AutomationBuilderNodeOutputVariables = () => {
  const { sourceNodes, emptyState } = useAutomationBuilderSecondarySidebar();

  return (
    <AutomationVariableBrowser
      sourceNodes={sourceNodes}
      emptyState={emptyState}
      sourceSectionTitle="Nodes"
    />
  );
};
