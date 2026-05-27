import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';

export const AutomationBuilderSecondarySidebarToggle = () => {
  const { isSecondarySidebarOpen, toggleSecondarySidebarOpen } =
    useAutomationBuilderSidebarHooks();

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleSecondarySidebarOpen}
          aria-label={
            isSecondarySidebarOpen
              ? 'Hide variables panel'
              : 'Open variables panel'
          }
        >
          <IconLayoutSidebarLeftCollapse />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="left">
        {isSecondarySidebarOpen
          ? 'Hide variables panel'
          : 'Open variables panel'}
      </Tooltip.Content>
    </Tooltip>
  );
};
