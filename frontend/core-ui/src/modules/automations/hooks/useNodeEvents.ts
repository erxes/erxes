import { useAutomation } from '@/automations/context/AutomationProvider';
import { automationBuilderSiderbarOpenState } from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { Node } from '@xyflow/react';
import { useSetAtom } from 'jotai';

export const useNodeEvents = () => {
  const setOpenSidebar = useSetAtom(automationBuilderSiderbarOpenState);
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

  const openNodeConfigurationForm = (nodeId: string) => {
    // Always open (not toggle): switching between nodes while the sidebar is
    // already open must not close it.
    setOpenSidebar(true);
    setQueryParams({ activeNodeId: nodeId });
  };

  const onNodeDoubleClick = (event: any, node: Node<NodeData>) => {
    const target = event.target as HTMLElement;

    const isCollapsibleTrigger = target.closest('[data-collapsible-trigger]');
    const isButton = target.closest('button');
    if (isCollapsibleTrigger || isButton) {
      return;
    }
    openNodeConfigurationForm(node.id);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  return {
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    openNodeConfigurationForm,
  };
};
