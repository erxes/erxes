import { useAutomation } from '@/automations/context/AutomationProvider';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Node } from '@xyflow/react';
import { useSetAtom } from 'jotai';

export const useNodeEvents = () => {
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { setQueryParams, setSelectedNode } = useAutomation();

  const onNodeClick = (_event: any, node: Node<NodeData>) => {
    setSelectedNode({
      id: node.id,
      type: node.data.type,
      nodeType: node.data.nodeType,
      label: node.data.label,
      icon: node.data.icon,
    });
  };

  const onNodeDoubleClick = (event: any, node: Node<NodeData>) => {
    const target = event.target as HTMLElement;

    const isCollapsibleTrigger = target.closest('[data-collapsible-trigger]');
    const isButton = target.closest('button');
    if (
      isCollapsibleTrigger ||
      isButton ||
      node.type === AutomationNodeType.Workflow
    ) {
      return;
    }

    toggleSideBarOpen();
    setQueryParams({ activeNodeId: node.id });
  };

  return {
    onNodeClick,
    onNodeDoubleClick,
  };
};
