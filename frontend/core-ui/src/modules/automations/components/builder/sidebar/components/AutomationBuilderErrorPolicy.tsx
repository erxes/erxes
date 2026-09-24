import { ActionErrorPolicySection } from '@/automations/components/builder/sidebar/components/content/action/ActionErrorPolicySection';
import { useAutomationActionContentSidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationActionContentSidebar';
import { IconAlertTriangle, IconChevronDown } from '@tabler/icons-react';
import { Collapsible, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * What happens when this step fails, beside the step it belongs to.
 *
 * It used to open in a sheet of its own from a menu two clicks away, which is
 * where a setting goes to be forgotten. It sits at the foot of the panel that
 * is already open while the step is configured — pinned rather than in the
 * variable list, which is long enough to bury anything below it.
 */
export const AutomationBuilderErrorPolicy = () => {
  const { currentAction, currentIndex } = useAutomationActionContentSidebar();
  const { t } = useTranslation('automations');
  const [isOpen, setIsOpen] = useState(false);

  if (!currentAction || currentIndex === -1) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex-none border-t bg-background"
    >
      <Collapsible.Trigger className="flex w-full items-center gap-2 px-5 py-3 text-left text-sm font-semibold hover:bg-accent">
        <IconAlertTriangle className="size-4 text-muted-foreground" />
        <span className="flex-auto">{t('error-handling-title')}</span>
        <IconChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="max-h-[50vh] overflow-y-auto px-5 pb-4">
        <ActionErrorPolicySection
          currentIndex={currentIndex}
          currentAction={currentAction}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};
