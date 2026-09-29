import { ActionErrorPolicySection } from '@/automations/components/builder/sidebar/components/content/action/ActionErrorPolicySection';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';

export const AutomationBuilderErrorPolicy = () => {
  const { currentAction, currentIndex } = useAutomationActionContentSidebar();

  if (!currentAction || currentIndex === -1) {
    return null;
  }

  return (
    <div className="px-5 py-4">
      <ActionErrorPolicySection
        currentIndex={currentIndex}
        currentAction={currentAction}
      />
    </div>
  );
};
