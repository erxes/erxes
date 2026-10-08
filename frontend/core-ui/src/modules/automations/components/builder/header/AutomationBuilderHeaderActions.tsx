import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { automationBuilderActiveTabState } from '@/automations/states/automationState';
import { AutomationNodeType } from '@/automations/types';
import { IconPlus } from '@tabler/icons-react';
import { Button, Toggle, Tooltip, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderHeaderActions = () => {
  const { t } = useTranslation('automations');
  const { isEmpty } = useAutomationNodes();
  const { editingWorkflowId, isReadOnly } = useAutomation();
  const activeTab = useAtomValue(automationBuilderActiveTabState);
  const { isOpenSideBar, activeNode, openNodeLibrary, closeNodeLibrary } =
    useAutomationBuilderSidebarHooks();

  if (activeTab !== 'builder' || editingWorkflowId || isReadOnly) {
    return null;
  }

  const isLibraryOpen = isOpenSideBar && !activeNode;
  const needsTrigger = isEmpty(AutomationNodeType.Trigger);
  const defaultNodeTab = needsTrigger
    ? AutomationNodeType.Trigger
    : AutomationNodeType.Action;

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Toggle
            variant="outline"
            className={cn(
              'data-[state=on]:shadow-focus data-[state=on]:bg-background bg-background text-foreground',
            )}
            pressed={isLibraryOpen}
            asChild
            onPressedChange={() =>
              isLibraryOpen
                ? closeNodeLibrary()
                : openNodeLibrary(defaultNodeTab)
            }
          >
            <Button variant="outline" className="whitespace-nowrap">
              <IconPlus className="shrink-0" />
              <span>
                {needsTrigger ? t('add-trigger') : t('header-add-action')}
              </span>
            </Button>
          </Toggle>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {isLibraryOpen
            ? t('header-close-node-library')
            : needsTrigger
            ? t('header-pick-what-starts')
            : t('header-pick-what-happens-next')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
