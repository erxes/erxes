import { Combobox, Command, IconComponent, Popover, cn } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';
import { AutomationNodeType } from '@/automations/types';

export const AutomationVariableSourceNodeList = ({
  activeSourceNodeId,
  sourceNodes,
  onSelectSourceNode,
}: {
  activeSourceNodeId: string;
  sourceNodes: TAutomationVariableSourceNode[];
  onSelectSourceNode: (nodeId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedNode = useMemo(
    () => sourceNodes.find((node) => node.id === activeSourceNodeId),
    [activeSourceNodeId, sourceNodes],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger>
        {selectedNode ? (
          <AutomationVariableSourceNodeValue node={selectedNode} />
        ) : (
          <Combobox.Value placeholder="Select node" />
        )}
      </Combobox.Trigger>
      <Combobox.Content>
        <Command shouldFilter>
          <Command.Input placeholder="Search nodes..." />
          <Command.Empty>No nodes found.</Command.Empty>
          <Command.List>
            {sourceNodes.map((node) => (
              <Command.Item
                key={node.id}
                className="py-2"
                value={node.id}
                onSelect={() => {
                  onSelectSourceNode(node.id);
                  setOpen(false);
                }}
              >
                <AutomationVariableSourceNodeValue node={node} />
                <Combobox.Check checked={node.id === activeSourceNodeId} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const AutomationVariableSourceNodeValue = ({
  node,
}: {
  node: TAutomationVariableSourceNode;
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      {node.icon ? (
        <span
          className={cn(
            'rounded-md p-1.5',
            node.nodeType === AutomationNodeType.Action
              ? 'bg-success/10 text-success'
              : 'bg-primary/10 text-primary',
          )}
        >
          <IconComponent className="size-4" name={node.icon} />
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate font-medium">{node.label}</span>
      <span className="text-xs text-muted-foreground">
        {node.nodeType === AutomationNodeType.Trigger ? 'Trigger' : 'Action'}
      </span>
    </div>
  );
};
