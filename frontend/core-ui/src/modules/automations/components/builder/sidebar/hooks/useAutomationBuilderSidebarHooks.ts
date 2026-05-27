import { useAutomation } from '@/automations/context/AutomationProvider';
import {
  automationBuilderSecondarySidebarOpenState,
  automationBuilderSiderbarOpenState,
  toggleAutomationBuilderSecondarySidebar,
  toggleAutomationBuilderOpenSidebar,
} from '@/automations/states/automationState';
import { NodeData } from '@/automations/types';
import { Node, useReactFlow } from '@xyflow/react';
import { useAtom, useSetAtom } from 'jotai';

export const useAutomationBuilderSidebarHooks = () => {
  const [isOpenSideBar, setIsOpenSideBar] = useAtom(
    automationBuilderSiderbarOpenState,
  );
  const [isSecondarySidebarOpen, setIsSecondarySidebarOpen] = useAtom(
    automationBuilderSecondarySidebarOpenState,
  );
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const toggleSecondarySidebarOpen = useSetAtom(
    toggleAutomationBuilderSecondarySidebar,
  );
  const { queryParams, setQueryParams } = useAutomation();
  const { getNode } = useReactFlow<Node<NodeData>>();
  const activeNode = getNode(queryParams?.activeNodeId || '')?.data;

  const handleClose = () => {
    setIsOpenSideBar(false);
    setIsSecondarySidebarOpen(false);
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: null,
    });
  };

  const handleBack = () => {
    setIsSecondarySidebarOpen(false);
    setQueryParams({
      activeNodeId: null,
      activeNodeTab: activeNode?.nodeType || null,
    });
  };

  return {
    setIsOpenSideBar,
    isOpenSideBar,
    isSecondarySidebarOpen,
    activeNode,
    handleBack,
    handleClose,
    toggleSideBarOpen,
    toggleSecondarySidebarOpen,
  };
};
