import { TabContentWrapper } from '@/automations/components/builder/sidebar/components/library/TabContentWrapper';
import { WorkflowsNodeLibrary } from '@/automations/components/builder/sidebar/components/library/WorkflowsNodeLibrary';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AUTOMATION_LIBRARY_TABS } from '@/automations/constants';
import { AutomationNodeType } from '@/automations/types';
import { Command, Tabs } from 'erxes-ui';

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

  const commonTabContentProps = {
    loading,
    error,
    refetch,
    onDragStart,
  };

  return (
    <Command className="h-full w-2xl">
      <Command.Input
        placeholder="Search..."
        variant="primary"
        className="pl-8"
      />

      <Tabs
        defaultValue={activeNodeTab || AutomationNodeType.Trigger}
        onValueChange={(value) =>
          setQueryParams({ activeNodeTab: value as AutomationNodeType })
        }
        className="flex-1 flex flex-col overflow-auto"
      >
        <Tabs.List className="w-full border-b">
          {AUTOMATION_LIBRARY_TABS.map(({ value, label }) => (
            <Tabs.Trigger key={value} value={value} className="w-1/3">
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

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
            className="flex-1 p-2 pt-0 mt-0 w-full overflow-auto flex-1"
          >
            <Command.Group className="space-y-2">
              <TabContentWrapper
                {...commonTabContentProps}
                type={type}
                list={list}
              />
            </Command.Group>
          </Tabs.Content>
        ))}
        <Tabs.Content
          className="space-y-2 "
          value={AutomationNodeType.Workflow}
        >
          <Command.Group>
            <WorkflowsNodeLibrary {...commonTabContentProps} />
          </Command.Group>
        </Tabs.Content>
      </Tabs>
    </Command>
  );
};
