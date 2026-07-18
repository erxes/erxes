import { CANVAS_FIT_VIEW_OPTIONS } from '@/automations/constants';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { IconFocusCentered } from '@tabler/icons-react';
import { Node, useReactFlow } from '@xyflow/react';
import {
  Button,
  Combobox,
  Command,
  IconComponent,
  Popover,
  Tooltip,
  cn,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';

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
  const { fitView, getNode } = useReactFlow<Node<NodeData>>();
  const selectedNode = useMemo(
    () => sourceNodes.find((node) => node.id === activeSourceNodeId),
    [activeSourceNodeId, sourceNodes],
  );
  const focusSelectedNode = () => {
    const node = getNode(activeSourceNodeId);

    if (!node) {
      return;
    }

    fitView({
      nodes: [node],
      duration: 300,
      ...CANVAS_FIT_VIEW_OPTIONS,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <Combobox.Trigger className="min-w-0 flex-1">
          {selectedNode ? (
            <AutomationVariableSourceNodeValue node={selectedNode} />
          ) : (
            <Combobox.Value placeholder="Select node" />
          )}
        </Combobox.Trigger>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Focus selected node"
              disabled={!selectedNode}
              onClick={focusSelectedNode}
            >
              <IconFocusCentered className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Focus selected node</Tooltip.Content>
        </Tooltip>
      </div>
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
                keywords={[node.label]}
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
        {node.kindLabel ??
          (node.nodeType === AutomationNodeType.Trigger ? 'Trigger' : 'Action')}
      </span>
    </div>
  );
};
