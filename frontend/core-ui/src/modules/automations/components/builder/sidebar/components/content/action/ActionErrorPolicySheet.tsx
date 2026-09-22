import { ActionErrorPolicySection } from '@/automations/components/builder/sidebar/components/content/action/ActionErrorPolicySection';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';
import { Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * What happens when a step fails is its own panel: it is read far less often
 * than the step's own settings, and it was crowding them.
 */
export const ActionErrorPolicySheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { currentAction, currentIndex } = useAutomationActionContentSidebar();
  const { t } = useTranslation('automations');

  if (!currentAction || currentIndex === -1) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-md">
        <Sheet.Header>
          <Sheet.Title>{t('error-handling-title')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <ActionErrorPolicySection
            currentIndex={currentIndex}
            currentAction={currentAction}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
