import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { automationBuilderActiveTabState } from '@/automations/states/automationState';
import { AutomationNodeType } from '@/automations/types';
import { IconPlus } from '@tabler/icons-react';
import { Button, Toggle, Tooltip, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';

export const AutomationBuilderHeaderActions = () => {
  const { isEmpty } = useAutomationNodes();
  const { editingWorkflowId } = useAutomation();
  const activeTab = useAtomValue(automationBuilderActiveTabState);
  const { isOpenSideBar, activeNode, openNodeLibrary, closeNodeLibrary } =
    useAutomationBuilderSidebarHooks();

  if (activeTab !== 'builder' || editingWorkflowId) {
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
              <span>{needsTrigger ? 'Add trigger' : 'Add action'}</span>
            </Button>
          </Toggle>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {isLibraryOpen
            ? 'Close the node library'
            : needsTrigger
            ? 'Pick what starts this automation'
            : 'Pick what happens next'}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
