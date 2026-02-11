import { TabContentWrapper } from '@/automations/components/builder/sidebar/components/library/TabContentWrapper';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationNodeType } from '@/automations/types';
import { Command, Tabs, Separator, Button } from 'erxes-ui';
import { useAutomationBuilderSidebarHooks } from '../../hooks/useAutomationBuilderSidebarHooks';
import { IconX } from '@tabler/icons-react';

export const AutomationNodeLibrarySidebar = () => {
  const {
    actionsConst,
    setQueryParams,
    activeNodeTab,
    triggersConst,
    loading,
    error,
    refetch,
    onDragStart,
  } = useAutomationNodeLibrarySidebar();
  const { handleClose } = useAutomationBuilderSidebarHooks();
  const commonTabContentProps = {
    loading,
    error,
    refetch,
    onDragStart,
  };

  return (
    <Tabs
      defaultValue={activeNodeTab || AutomationNodeType.Trigger}
      value={activeNodeTab || AutomationNodeType.Trigger}
      onValueChange={(value) =>
        setQueryParams({ activeNodeTab: value as AutomationNodeType })
      }
      className="flex-1 flex flex-col overflow-auto"
    >
      <Tabs.Content
        value={AutomationNodeType.Trigger}
        className="bg-background"
      >
        <div className="flex-col p-5 font-semibold ">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Choose your trigger type</h3>
            <Button size="icon" variant="secondary" onClick={handleClose}>
              <IconX className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-normal whitespace-pre-wrap">
            {`Start with an automation type that enrolls and
triggers off`}
          </p>
        </div>
        <Separator />
      </Tabs.Content>
      <Tabs.Content value={AutomationNodeType.Action} className="bg-background">
        <div className="flex-col p-5 font-semibold ">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Choose your action type</h3>
            <Button size="icon" variant="secondary" onClick={handleClose}>
              <IconX className="size-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-normal whitespace-pre-wrap">
            {`Start with an automation type that enrolls and 
triggers off`}
          </p>
        </div>
        <Separator />
      </Tabs.Content>
      <div className="p-5">
        <Command className="h-full w-2xl gap-3 bg-sidebar">
          <Command.Input
            placeholder="Search..."
            variant="primary"
            wrapperClassName=" bg-white m-1 rounded-md shadow-xs"
            autoFocus
          />
          <div>
            {[
              {
                type: AutomationNodeType.Trigger,
                list: triggersConst,
              },
              { type: AutomationNodeType.Action, list: actionsConst },
            ].map(({ type, list = [] }, index) => (
              <Tabs.Content
                key={index}
                value={type}
                className="flex-1 p-0 w-full overflow-auto"
              >
                <Command.Group className="flex p-0">
                  <TabContentWrapper
                    {...commonTabContentProps}
                    type={type}
                    list={list}
                  />
                </Command.Group>
              </Tabs.Content>
            ))}
          </div>
          {/* // TODO  */}
          {/* <Tabs.Content
          className="space-y-2 "
          value={AutomationNodeType.Workflow}
        >
          <Command.Group>
            <WorkflowsNodeLibrary {...commonTabContentProps} />
            </Command.Group>
            </Tabs.Content> */}
        </Command>
      </div>
    </Tabs>
  );
};
