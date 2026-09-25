import { WORKFLOW_INPUT_NODE_ID } from '@/automations/components/builder/nodes/components/WorkflowInputNode';
import { NOTE_NODE_TYPE } from '@/automations/constants/notes';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { NodeData } from '@/automations/types';
import { Node } from '@xyflow/react';

export const useNodeEvents = () => {
  const {
    setQueryParams,
    setSelectedNode,
    setSidebarOpen: setOpenSidebar,
  } = useAutomation();

  const onNodeClick = (_event: any, node: Node<NodeData>) => {
    // Canvas annotations carry no flow metadata, so selecting one must not
    // become the sidebar's active node.
    if (node.type === NOTE_NODE_TYPE) {
      return;
    }

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
    // Neither the workflow Input stub nor a note has a configuration form.
    if (node.id === WORKFLOW_INPUT_NODE_ID || node.type === NOTE_NODE_TYPE) {
      return;
    }

    const target = event.target as HTMLElement;

    const isCollapsibleTrigger = target.closest('[data-collapsible-trigger]');
    const isButton = target.closest('button');
    // Portaled overlays (e.g. the workflow edit sheet) are React children of
    // their node, so their events bubble here even though the DOM target
    // lives outside the node element — ignore those.
    const isOutsideNodeElement =
      event.currentTarget instanceof HTMLElement &&
      !event.currentTarget.contains(target);
    if (isCollapsibleTrigger || isButton || isOutsideNodeElement) {
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
