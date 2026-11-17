import { IconFocusCentered } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  IconComponent,
  Popover,
  Tooltip,
  cn,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TAutomationVariableSourceNode } from '../AutomationVariableBrowserTypes';
import {
  useAutomationVariableSourceNodeList,
  useAutomationVariableSourceNodeValue,
} from '../hooks/useAutomationVariableSourceNodeList';

export const AutomationVariableSourceNodeList = ({
  activeSourceNodeId,
  sourceNodes,
  onSelectSourceNode,
}: {
  activeSourceNodeId: string;
  sourceNodes: TAutomationVariableSourceNode[];
  onSelectSourceNode: (nodeId: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { open, setOpen, selectedNode, focusSelectedNode, selectNode } =
    useAutomationVariableSourceNodeList({
      activeSourceNodeId,
      sourceNodes,
      onSelectSourceNode,
    });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <Combobox.Trigger className="min-w-0 flex-1">
          {selectedNode ? (
            <AutomationVariableSourceNodeValue node={selectedNode} />
          ) : (
            <Combobox.Value placeholder={t('sidebar-select-node')} />
          )}
        </Combobox.Trigger>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label={t('sidebar-focus-selected-node')}
              disabled={!selectedNode}
              onClick={focusSelectedNode}
            >
              <IconFocusCentered className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>{t('sidebar-focus-selected-node')}</Tooltip.Content>
        </Tooltip>
      </div>
      <Combobox.Content>
        <Command shouldFilter>
          <Command.Input placeholder={t('sidebar-search-nodes')} />
          <Command.Empty>{t('sidebar-no-nodes-found')}</Command.Empty>
          <Command.List>
            {sourceNodes.map((node) => (
              <Command.Item
                key={node.id}
                className="py-2"
                value={node.id}
                keywords={[node.label]}
                onSelect={() => selectNode(node.id)}
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
  const { colorClassName, label, kindLabel } =
    useAutomationVariableSourceNodeValue(node);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={cn('rounded-md p-1.5', colorClassName)}>
        <IconComponent className="size-4" name={node.icon} />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{kindLabel}</span>
    </div>
  );
};
