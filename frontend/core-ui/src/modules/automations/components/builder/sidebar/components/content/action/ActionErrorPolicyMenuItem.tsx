import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';
import { supportsErrorPolicy } from '@/automations/utils/automationBuilderUtils/actionFolks';
import { IconAlertTriangle } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Only offered on steps that can act on a failure, so the menu never opens a
 * panel with nothing in it.
 */
export const ActionErrorPolicyMenuItem = ({
  onSelect,
}: {
  onSelect: () => void;
}) => {
  const { actionConstMap } = useAutomation();
  const { currentAction } = useAutomationActionContentSidebar();
  const { t } = useTranslation('automations');

  if (
    !currentAction ||
    !supportsErrorPolicy(actionConstMap.get(currentAction.type))
  ) {
    return null;
  }

  return (
    <DropdownMenu.Item onClick={onSelect}>
      <IconAlertTriangle />
      {t('error-handling-title')}
    </DropdownMenu.Item>
  );
};
