import { AutomationVariableBrowser } from '@/automations/components/builder/components/AutomationVariableBrowser';
import { useAutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondarySidebar';

export const AutomationBuilderNodeOutputVariables = () => {
  const { sourceNode, emptyState } = useAutomationBuilderSecondarySidebar();

  return (
    <AutomationVariableBrowser sourceNode={sourceNode} emptyState={emptyState} />
  );
};
