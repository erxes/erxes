import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  automationBuilderSiderbarOpenState,
  toggleAutomationBuilderOpenSidebar,
} from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';
import { useAtom, useSetAtom } from 'jotai';

export const useAutomationBuilderSidebarHooks = () => {
  const [isOpenSideBar, setIsOpenSideBar] = useAtom(automationBuilderSiderbarOpenState);
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const { queryParams, setQueryParams } = useAutomation();
  const { getNode } = useReactFlow<Node<NodeData>>();
  const activeNode = getNode(queryParams?.activeNodeId || '')?.data;

  const handleClose = () => {
    setIsOpenSideBar(false);
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: null,
    });
  };

  const handleBack = () => {
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: activeNode?.nodeType || null,
    });
  };

  return {
    setIsOpenSideBar,
    isOpenSideBar,
    activeNode,
    handleBack,
    handleClose,
    toggleSideBarOpen,
  };
};
