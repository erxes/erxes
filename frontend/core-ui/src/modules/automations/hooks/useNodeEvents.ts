import { useAutomation } from '@/automations/context/AutomationProvider';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { AutomationNodeType, NodeData } from '@/automations/types';
import { Node } from '@xyflow/react';
import { useSetAtom } from 'jotai';

export const useNodeEvents = () => {
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { setQueryParams } = useAutomation();

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
    onNodeDoubleClick,
  };
};
