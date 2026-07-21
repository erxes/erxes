import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { IconLayoutSidebarLeftCollapse } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderSecondarySidebarToggle = () => {
  const { t } = useTranslation('automations');
  const { isSecondarySidebarOpen, toggleSecondarySidebarOpen } =
    useAutomationBuilderSidebarHooks();

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleSecondarySidebarOpen}
          aria-label={
            isSecondarySidebarOpen
              ? t('hide-variables-panel', 'Hide variables panel')
              : t('open-variables-panel', 'Open variables panel')
          }
        >
          <IconLayoutSidebarLeftCollapse />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="left">
        {isSecondarySidebarOpen
          ? t('hide-variables-panel', 'Hide variables panel')
          : t('open-variables-panel', 'Open variables panel')}
      </Tooltip.Content>
    </Tooltip>
  );
};
