import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  automationBuilderSiderbarOpenState,
  toggleAutomationBuilderOpenSidebar,
} from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';
import { useAtomValue, useSetAtom } from 'jotai';

export const useAutomationBuilderSidebarHooks = () => {
  const isOpenSideBar = useAtomValue(automationBuilderSiderbarOpenState);
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { queryParams, setQueryParams } = useAutomation();
  const { getNode } = useReactFlow<Node<NodeData>>();
  const activeNode = getNode(queryParams?.activeNodeId || '')?.data;

  const handleClose = () => {
    toggleSideBarOpen();
    setQueryParams({
      activeNodeId: null,
    });
  };

  const handleBack = () => {
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: activeNode?.nodeType || null,
    });
  };

  return {
    isOpenSideBar,
    activeNode,
    handleBack,
    handleClose,
    toggleSideBarOpen,
  };
};
