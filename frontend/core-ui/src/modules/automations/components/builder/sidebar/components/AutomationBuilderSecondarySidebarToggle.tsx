import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';

export const AutomationBuilderSecondarySidebarToggle = () => {
  const { isSecondarySidebarOpen, toggleSecondarySidebarOpen } =
    useAutomationBuilderSidebarHooks();

  const label = isSecondarySidebarOpen
    ? 'Hide variables panel'
    : 'Open variables panel';

  return (
    <DropdownMenu.Item onClick={toggleSecondarySidebarOpen} aria-label={label}>
      <IconLayoutSidebarLeftCollapse />
      {label}
    </DropdownMenu.Item>
  );
};
