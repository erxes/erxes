import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderSecondarySidebarToggle = () => {
  const { t } = useTranslation('automations');
  const { isSecondarySidebarOpen, toggleSecondarySidebarOpen } =
    useAutomationBuilderSidebarHooks();

  const label = isSecondarySidebarOpen
    ? t('hide-variables-panel', 'Hide variables panel')
    : t('open-variables-panel', 'Open variables panel');

  return (
    <DropdownMenu.Item onClick={toggleSecondarySidebarOpen} aria-label={label}>
      <IconLayoutSidebarLeftCollapse />
      {label}
    </DropdownMenu.Item>
  );
};
