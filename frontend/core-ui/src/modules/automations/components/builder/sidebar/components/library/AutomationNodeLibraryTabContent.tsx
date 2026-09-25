import { NodeLibraryRow } from '@/automations/components/builder/sidebar/components/library/NodeLibraryRow';
import { useAutomationNodeLibraryGroups } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibraryGroups';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { IconPointerBolt } from '@tabler/icons-react';
import { Button, Command } from 'erxes-ui';
import {
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';
import { useAutomationNodeLibraryProvider } from '../../context/AutomationNodeLibraryProvider';

interface AutomationNodeLibraryTabContentProps {
  type: AutomationNodeType.Trigger | AutomationNodeType.Action;
  list:
    | IAutomationsTriggerConfigConstants[]
    | IAutomationsActionConfigConstants[];
}

export const NODE_LIBRARY_GROUP_CLASS =
  'mx-auto max-w-[420px] p-0 pb-4 [&_[cmdk-group-heading]]:px-0 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2';

export const AutomationNodeLibraryTabContent = ({
  type,
  list,
}: AutomationNodeLibraryTabContentProps) => {
  const { onDragStart, onSelectNode } = useAutomationNodeLibraryProvider();
  const groups = useAutomationNodeLibraryGroups({ type, list });
  const { isEmpty } = useAutomationNodes();
  const { openNodeLibrary } = useAutomationBuilderSidebarHooks();

  if (
    type === AutomationNodeType.Action &&
    isEmpty(AutomationNodeType.Trigger) &&
    isEmpty(AutomationNodeType.Action)
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <IconPointerBolt className="size-8 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Start with a trigger</p>
          <p className="text-sm text-muted-foreground">
            Actions run after something starts this automation.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => openNodeLibrary(AutomationNodeType.Trigger)}
        >
          Choose a trigger
        </Button>
      </div>
    );
  }

  return (
    <>
      <Command.Empty />
      {groups.map((group) => (
        <Command.Group
          key={group.name}
          heading={group.name}
          className={NODE_LIBRARY_GROUP_CLASS}
        >
          {group.list.map((item) => (
            <NodeLibraryRow
              key={item.type}
              item={item}
              nodeType={type}
              onDragStart={onDragStart}
              onSelectNode={onSelectNode}
            />
          ))}
        </Command.Group>
      ))}
    </>
  );
};
