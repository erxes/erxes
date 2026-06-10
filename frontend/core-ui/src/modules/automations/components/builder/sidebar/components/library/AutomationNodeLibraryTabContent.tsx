import { NodeLibraryRow } from '@/automations/components/builder/sidebar/components/library/NodeLibraryRow';
import { useAutomationNodeLibraryGroups } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibraryGroups';
import { AutomationNodeType } from '@/automations/types';
import { Command } from 'erxes-ui';
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

export const AutomationNodeLibraryTabContent = ({
  type,
  list,
}: AutomationNodeLibraryTabContentProps) => {
  const { onDragStart, onSelectNode } = useAutomationNodeLibraryProvider();
  const groups = useAutomationNodeLibraryGroups({ type, list });

  return (
    <>
      <Command.Empty />
      {groups.map((group) => (
        <Command.Group
          key={group.name}
          heading={group.name}
          className="mx-auto max-w-[420px] p-0 pb-4 [&_[cmdk-group-heading]]:px-0 [&_[cmdk-group-heading]]:pb-2 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-2"
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
